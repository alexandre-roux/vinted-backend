const cloudinary = require("cloudinary").v2;
const {SHA256} = require("crypto-js");
const express = require("express");
const uid2 = require("uid2");
const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// Models import
const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
    console.log(req.fields);
    try {
        // Check fields
        if (!req.fields.email) {
            res.status(400).json({error: {message: "Invalid request: email is mandatory"}});
            return;
        }
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        if (!emailRegex.test(req.fields.email)) {
            res.status(400).json({error: {message: "Invalid request: email is not valid"}});
            return;
        }
        if (!req.fields.username) {
            res.status(400).json({error: {message: "Invalid request: username is mandatory"}});
            return;
        }
        if (!req.fields.password) {
            res.status(400).json({error: {message: "Invalid request: password is mandatory"}});
            return
        }

        // Check if email hasn't already been used
        if (req.fields.email) {
            const alreadyExistingUser = await User.findOne({
                email: req.fields.email,
            });
            if (alreadyExistingUser) {
                res.status(409).json({
                    error: {
                        message:
                            "Invalid request: a user is already registered with this email",
                    },
                });
                return;
            }
        }

        const salt = uid2(16);
        console.log("password: " + req.fields.password + ", salt: " + salt);
        const hash = SHA256(req.fields.password + salt);
        console.log("hash: " + hash);
        const token = uid2(16);

        // Create user
        const newUser = new User({
            email: req.fields.email,
            account: {
                username: req.fields.username,
                phone: req.fields.phone,
            },
            token: token,
            hash: hash,
            salt: salt,
        });

        // Handle image
        if (req.files.picture) {
            try {
                newUser.account.avatar = await cloudinary.uploader.upload(
                    req.files.picture.path
                );
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

router.post("/user/login", async (req, res) => {
    console.log(req.fields);
    try {
        if (!req.fields.email || !req.fields.password) {
            res.status(400).json({error: {message: "Invalid request: missing email or password"}});
            return;
        }

        const user = await User.findOne({email: req.fields.email});
        if (!user) {
            res.status(404).json({error: {message: "User unknown"}});
            return;
        }

        const hash = SHA256(req.fields.password + user.salt);
        if (hash != user.hash) {
            res.status(401).json({error: {message: "Unauthorized"}});
            return;
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
