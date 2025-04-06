const cloudinary = require("cloudinary");
const express = require("express");
const Joi = require("joi");
const isAuthenticated = require("../isAuthenticated");
const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// Models import
const Offer = require("../models/Offer");

// Create offer
router.post("/offer/publish", isAuthenticated, async (req, res) => {
    console.log(req.fields);

    const offerSchema = Joi.object({
        title: Joi.string().max(50).required(),
        description: Joi.string().max(500),
        price: Joi.number().positive().max(100000).required(),
        brand: Joi.string(),
        size: Joi.string(),
        condition: Joi.string(),
        color: Joi.string(),
        city: Joi.string(),
    });

    try {
        // Check fields
        const {error} = offerSchema.validate(req.fields);
        if (error) {
            return res.status(400).json({error: {message: error.details[0].message}});
        }

        const newOffer = new Offer({
            product_name: req.fields.title,
            product_description: req.fields.description,
            product_price: req.fields.price,
            product_details: [
                {brand: req.fields.brand},
                {size: req.fields.size},
                {condition: req.fields.condition},
                {color: req.fields.color},
                {city: req.fields.city},
            ],
            owner: req.user,
        });

        // Save picture on Cloudinary
        if (req.files.picture) {
            newOffer.product_image = await cloudinary.uploader.upload(req.files.picture.path, {
                public_id: newOffer._id,
                folder: "/vinted/offers/",
            });
        }

        await newOffer.save();
        res.status(200).json(newOffer);
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

router.get("/offers", async (req, res) => {
    console.log(req.query);

    try {
        const {title, priceMin, priceMax, sort, page = 1} = req.query;
        let query = Offer.find().populate("owner");

        if (title) query.where({product_name: new RegExp(title, "i")});
        if (priceMin) query.where({product_price: {$gte: priceMin}});
        if (priceMax) query.where({product_price: {$lte: priceMax}});
        if (sort === "price-desc") query.sort({product_price: "desc"});
        if (sort === "price-asc") query.sort({product_price: "asc"});

        query.limit(5).skip(5 * (page - 1));
        const result = await query.exec();
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

router.delete("/offer/:offerId", isAuthenticated, async (req, res) => {
    console.log(req.params);

    try {
        let offerToDelete = await Offer.findById(req.params.offerId);
        if (!offerToDelete) {
            res.status(400).json({message: "Wrong ID"});
            return;
        }

        await cloudinary.uploader.destroy(offerToDelete.product_image.public_id);
        await Offer.findByIdAndDelete(offerToDelete._id);
        res.status(200).json({message: "Offer deleted"});
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

router.put("/offer/:offerId", isAuthenticated, async (req, res) => {
    console.log(req.params);

    try {
        let offerToEdit = await Offer.findById(req.params.offerId);
        if (!offerToEdit) {
            res.status(404).json({message: "Wrong ID"});
            return;
        }

        const {error} = offerUpdateSchema.validate(req.fields);
        if (error) {
            return res.status(400).json({error: {message: error.details[0].message}});
        }

        if (req.fields.title) offerToEdit.product_name = req.fields.title;
        if (req.fields.description)
            offerToEdit.product_description = req.fields.description;
        if (req.fields.price) offerToEdit.product_price = req.fields.price;

        offerToEdit.product_details.forEach((detail) => {
            const key = Object.keys(detail);
            if (req.fields[key]) detail[key] = req.fields[key];
        });

        // Image
        if (req.files.picture) {
            const result = await cloudinary.uploader.upload(req.files.picture.path, {
                public_id: offerToEdit._id,
                folder: "/vinted/offers/",
            });
            offerToEdit.product_image = result;
        }

        await offerToEdit.save();
        res.status(200).json(offerToEdit);
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

router.get("/offer/:offerId", async (req, res) => {
    console.log(req.params);

    try {
        let offer = await Offer.findById(req.params.offerId).populate("owner");
        res.status(200).json(offer);
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

module.exports = router;
