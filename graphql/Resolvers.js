const {SHA256} = require("crypto-js");
const User = require("../models/User");
const Offer = require("../models/Offer");
const {loginSchema, signupSchema} = require("../validators/users");
const {offerCreateSchema, offerGetSchema, offerUpdateSchema} = require("../validators/offers");
const uid2 = require("uid2");
const {v2: cloudinary} = require("cloudinary");

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// Authentication helper function
const authenticate = async (context) => {
    const request = context.req;

    if (!request.headers.authorization) {
        throw new Error("Unauthorized: No token provided");
    }

    const token = request.headers.authorization.replace("Bearer ", "");
    const user = await User.findOne({token});

    if (!user) {
        throw new Error("Unauthorized: Invalid token");
    }

    return user;
}

const resolvers = {
    // User authentication
    login: async ({email, password}) => {
        const {error} = loginSchema.validate({email, password});
        if (error) {
            throw new Error(error.details[0].message);
        }

        try {
            const user = await User.findOne({email: email});
            if (!user) {
                throw new Error("User not found.");
            }

            const hash = SHA256(password + user.salt).toString();
            if (hash !== user.hash) {
                throw new Error("Unauthorized: invalid password.");
            }

            return user.account
        } catch (err) {
            throw new Error(err.message);
        }
    },

    signup: async ({email, username, password, phone, avatar}) => {
        const {error} = signupSchema.validate({email, username, password, phone, avatar});
        if (error) {
            throw new Error(error.details[0].message);
        }

        try {
            const existingUser = await User.findOne({email});
            if (existingUser) {
                throw new Error("A user is already registered with this email.");
            }

            const salt = uid2(16);
            const hash = SHA256(password + salt).toString();
            const token = uid2(16);

            const newUser = new User({
                email,
                account: {username, phone},
                token,
                hash,
                salt,
            });

            // Optional avatar upload
            if (avatar) {
                try {
                    newUser.account.avatar = await cloudinary.uploader.upload(avatar);
                } catch (uploadError) {
                    throw new Error("Cloudinary upload failed: " + uploadError.error);
                }
            }

            await newUser.save();

            return newUser;
        } catch (err) {
            throw new Error(err.message);
        }
    },

    // Offer queries
    offers: async ({title, priceMin, priceMax, sort, page = 1}) => {
        const {error} = offerGetSchema.validate({title, priceMin, priceMax, sort, page});
        if (error) {
            throw new Error(error.details[0].message);
        }

        try {
            const query = Offer.find().populate("owner");

            if (title) query.where({product_name: new RegExp(title, "i")});
            if (priceMin) query.where({product_price: {$gte: priceMin}});
            if (priceMax) query.where({product_price: {$lte: priceMax}});

            if (sort === "price-desc") query.sort({product_price: "desc"});
            if (sort === "price-asc") query.sort({product_price: "asc"});

            query.limit(5).skip(5 * (page - 1));

            return await query.exec();
        } catch (err) {
            throw new Error(err.message);
        }
    },

    offer: async ({id}) => {
        if (!id) {
            throw new Error("Missing offer ID");
        }

        try {
            const offer = await Offer.findById(id).populate("owner");
            if (!offer) {
                throw new Error("Offer not found");
            }

            return offer;
        } catch (err) {
            throw new Error(err.message);
        }
    },

    // Offer mutations
    createOffer: async ({title, description, price, brand, size, condition, color, city, picture}, context) => {
        try {
            // Authenticate user
            const user = await authenticate(context);

            // Validate input
            const offerData = {
                title,
                description,
                price,
                brand,
                size,
                condition,
                color,
                city
            };

            const {error} = offerCreateSchema.validate(offerData);
            if (error) {
                throw new Error(error.details[0].message);
            }

            // Create new offer
            const newOffer = new Offer({
                product_name: title,
                product_description: description,
                product_price: price,
                product_details: [
                    {brand: brand || ""},
                    {size: size || ""},
                    {condition: condition || ""},
                    {color: color || ""},
                    {city: city || ""},
                ],
                owner: user,
            });

            // Upload picture if provided
            if (picture) {
                newOffer.product_image = await cloudinary.uploader.upload(picture, {
                    public_id: newOffer._id,
                    folder: "/vinted/offers/",
                });
            }

            await newOffer.save();
            return newOffer;
        } catch (err) {
            throw new Error(err.message);
        }
    },

    updateOffer: async ({id, title, description, price, brand, size, condition, color, city, picture}, context) => {
        try {
            // Authenticate user
            const user = await authenticate(context);

            // Validate input
            if (!id) {
                throw new Error("Missing offer ID");
            }

            const updateData = {
                title,
                description,
                price,
                brand,
                size,
                condition,
                color,
                city
            };

            // Remove undefined fields
            Object.keys(updateData).forEach(key =>
                updateData[key] === undefined && delete updateData[key]
            );

            const {error} = offerUpdateSchema.validate(updateData);
            if (error) {
                throw new Error(error.details[0].message);
            }

            // Find offer
            const existingOffer = await Offer.findById(id);
            if (!existingOffer) {
                throw new Error("Offer not found");
            }

            // Update offer fields
            if (title) existingOffer.product_name = title;
            if (description) existingOffer.product_description = description;
            if (price) existingOffer.product_price = price;

            // Update product details
            if (existingOffer.product_details && existingOffer.product_details.length > 0) {
                existingOffer.product_details.forEach((detail) => {
                    const key = Object.keys(detail)[0];
                    if (key === 'brand' && brand !== undefined) detail.brand = brand;
                    if (key === 'size' && size !== undefined) detail.size = size;
                    if (key === 'condition' && condition !== undefined) detail.condition = condition;
                    if (key === 'color' && color !== undefined) detail.color = color;
                    if (key === 'city' && city !== undefined) detail.city = city;
                });
            } else {
                // Create product details if they don't exist
                existingOffer.product_details = [
                    {brand: brand || ""},
                    {size: size || ""},
                    {condition: condition || ""},
                    {color: color || ""},
                    {city: city || ""}
                ];
            }

            // Upload new picture if provided
            if (picture) {
                existingOffer.product_image = await cloudinary.uploader.upload(picture, {
                    public_id: existingOffer._id,
                    folder: "/vinted/offers/",
                });
            }

            await existingOffer.save();
            return existingOffer;
        } catch (err) {
            throw new Error(err.message);
        }
    },

    deleteOffer: async ({id}, context) => {
        try {
            // Authenticate user
            const user = await authenticate(context);

            // Validate input
            if (!id) {
                throw new Error("Missing offer ID");
            }

            // Find offer
            const offer = await Offer.findById(id);
            if (!offer) {
                throw new Error("Offer not found");
            }

            // Delete image from Cloudinary if exists
            if (offer.product_image?.public_id) {
                await cloudinary.uploader.destroy(offer.product_image.public_id);
            }

            // Delete offer
            await Offer.findByIdAndDelete(offer._id);
            return "Offer deleted successfully";
        } catch (err) {
            throw new Error(err.message);
        }
    }
};

module.exports = resolvers;
