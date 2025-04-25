const {SHA256} = require("crypto-js");
const User = require("../models/User");
const {loginSchema, signupSchema} = require("../validators/users");
const uid2 = require("uid2");
const {v2: cloudinary} = require("cloudinary");

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const resolvers = {
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
    }
};

module.exports = resolvers;