const cloudinary = require("cloudinary").v2;
const {SHA256} = require("crypto-js");
const express = require("express");
const uid2 = require("uid2");
const Joi = require("joi");

const router = express.Router();
const User = require("../models/User");
const {signupSchema, loginSchema} = require("../validators/users");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// Signup
router.post("/user/signup", async (req, res) => {
    // Validate input
    const {error, value} = signupSchema.validate(req.fields);
    if (error) {
        return res.status(400).json({error: {message: error.details[0].message}});
    }

    try {
        const {email, username, password, phone} = value;

        // Check for existing user
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(409).json({
                error: {
                    message: "Invalid request: a user is already registered with this email",
                },
            });
        }

        const salt = uid2(16);
        const hash = SHA256(password + salt).toString();
        const token = uid2(16);

        const newUser = new User({
            email,
            account: {
                username,
                phone,
            },
            token,
            hash,
            salt,
        });

        // Handle image
        if (req.files?.picture) {
            try {
                newUser.account.avatar = await cloudinary.uploader.upload(req.files.picture.path);
            } catch (error) {
                console.error("Error uploading to Cloudinary:", error.message);
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
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

// Login
router.post("/user/login", async (req, res) => {
    const {error, value} = loginSchema.validate(req.fields);
    // Validate input
    if (error) {
        return res.status(400).json({error: {message: error.details[0].message}});
    }

    try {
        const {username, password} = value;

        const user = await User.findOne({"account.username": username});
        if (!user) {
            return res.status(404).json({error: {message: "User unknown"}});
        }

        const hash = SHA256(password + user.salt).toString();
        if (hash !== user.hash) {
            return res.status(401).json({error: {message: "Unauthorized"}});
        }

        res.status(200).json({
            _id: user._id,
            token: user.token,
            account: {
                username: user.account.username,
                phone: user.account.phone,
            },
        });
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

module.exports = router;
