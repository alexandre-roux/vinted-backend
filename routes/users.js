const express = require("express");
const {SHA256} = require("crypto-js");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
const User = require("../models/User");
const {signupSchema, loginSchema} = require("../validators/users");

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// Signup route
router.post("/user/signup", async (req, res) => {
    const {error, value} = signupSchema.validate(req.fields);
    if (error) {
        return res.status(400).json({error: {message: error.details[0].message}});
    }

    const {email, username, password, phone} = value;

    try {
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(409).json({
                error: {
                    message: "A user is already registered with this email.",
                },
            });
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
        if (req.files?.picture?.path) {
            try {
                newUser.account.avatar = await cloudinary.uploader.upload(req.files.picture.path);
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError.message);
            }
        }

        await newUser.save();

        res.status(200).json({
            _id: newUser._id,
            token: newUser.token,
            account: {
                username: newUser.account.username,
                phone: newUser.account.phone,
                avatar: newUser.account.avatar,
            },
        });
    } catch (err) {
        res.status(500).json({error: {message: err.message}});
    }
});

// Login route
router.post("/user/login", async (req, res) => {
    const {error, value} = loginSchema.validate(req.fields);
    if (error) {
        return res.status(400).json({error: {message: error.details[0].message}});
    }

    const {email, password} = value;

    try {
        const user = await User.findOne({"account.email": email});
        if (!user) {
            return res.status(404).json({error: {message: "User not found."}});
        }

        const hash = SHA256(password + user.salt).toString();
        if (hash !== user.hash) {
            return res.status(401).json({error: {message: "Unauthorized: invalid password."}});
        }

        res.status(200).json({
            _id: user._id,
            token: user.token,
            account: {
                username: user.account.username,
                phone: user.account.phone,
                avatar: user.account.avatar,
            },
        });
    } catch (err) {
        res.status(500).json({error: {message: err.message}});
    }
});

module.exports = router;
