const {SHA256} = require("crypto-js");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const {signupSchema, loginSchema} = require("../validators/users");

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const resolvers = {
    signUp: async ({email, username, password, phone, avatar}) => {
        const {error, value} = signupSchema.validate({email, username, password, phone});
        if (error) {
            throw new Error(error.details[0].message);
        }

        const {
            email: validatedEmail,
            username: validatedUsername,
            password: validatedPassword,
            phone: validatedPhone
        } = value;

        try {
            const existingUser = await User.findOne({email: validatedEmail});
            if (existingUser) {
                throw new Error("A user is already registered with this email.");
            }

            const salt = uid2(16);
            const hash = SHA256(validatedPassword + salt).toString();
            const token = uid2(16);

            const newUser = new User({
                email: validatedEmail,
                account: {username: validatedUsername, phone: validatedPhone},
                token,
                hash,
                salt,
            });

            // Téléchargement optionnel de l'avatar
            if (avatar?.path) {
                try {
                    newUser.account.avatar = await cloudinary.uploader.upload(avatar.path);
                } catch (uploadError) {
                    console.error("Cloudinary upload failed:", uploadError.message);
                }
            }

            await newUser.save();

            return {
                id: newUser._id,
                email: newUser.email,
                account: {
                    username: newUser.account.username,
                    phone: newUser.account.phone,
                    avatar: newUser.account.avatar,
                },
                token: newUser.token,
                hash: newUser.hash,
                salt: newUser.salt,
            };
        } catch (err) {
            throw new Error(err.message);
        }
    },

    login: async ({email, password}) => {
        const {error, value} = loginSchema.validate({email, password});
        if (error) {
            throw new Error(error.details[0].message);
        }

        const {email: validatedEmail, password: validatedPassword} = value;

        try {
            const user = await User.findOne({email: validatedEmail});
            if (!user) {
                throw new Error("User not found.");
            }

            const hash = SHA256(validatedPassword + user.salt).toString();
            if (hash !== user.hash) {
                throw new Error("Unauthorized: invalid password.");
            }

            return {
                id: user._id,
                email: user.email,
                account: {
                    username: user.account.username,
                    phone: user.account.phone,
                    avatar: user.account.avatar,
                },
                token: user.token,
                hash: user.hash,
                salt: user.salt,
            };
        } catch (err) {
            throw new Error(err.message);
        }
    },
};

module.exports = resolvers;