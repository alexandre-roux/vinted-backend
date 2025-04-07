// noinspection JSUnresolvedReference
const cloudinary = require("cloudinary").v2;
const express = require("express");
const isAuthenticated = require("../isAuthenticated");
const router = express.Router();

const Offer = require("../models/Offer");
const {offerCreateSchema, offerGetSchema, offerUpdateSchema} = require("../validators/offers");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

// Create Offer
router.post("/offer/publish", isAuthenticated, async (req, res) => {
    const {error} = offerCreateSchema.validate(req.fields);
    if (error) {
        return res.status(400).json({error: {message: error.details[0].message}});
    }

    try {
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

        if (req.files?.picture?.path) {
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

// Get Offers
router.get("/offers", async (req, res) => {
    const {error} = offerGetSchema.validate(req.fields);
    if (error) {
        return res.status(400).json({error: {message: error.details[0].message}});
    }

    try {
        const {title, priceMin, priceMax, sort, page = 1} = req.query;
        const query = Offer.find().populate("owner");

        if (title) query.where({product_name: new RegExp(title, "i")});
        if (priceMin) query.where({product_price: {$gte: priceMin}});
        if (priceMax) query.where({product_price: {$lte: priceMax}});

        if (sort === "price-desc") query.sort({product_price: "desc"});
        if (sort === "price-asc") query.sort({product_price: "asc"});

        query.limit(5).skip(5 * (page - 1));

        const offers = await query.exec();
        res.status(200).json(offers);
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

// Get Offer by ID
router.get("/offer/:offerId", async (req, res) => {
    if (!req.params.offerId) {
        res.status(400).json({error: {message: "Missing offer ID"}});
    }

    try {
        const offer = await Offer.findById(req.params.offerId).populate("owner");
        if (!offer) return res.status(404).json({message: "Offer not found"});

        res.status(200).json(offer);
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

// Delete Offer
router.delete("/offer/:offerId", isAuthenticated, async (req, res) => {
    if (!req.params.offerId) {
        res.status(400).json({error: {message: "Missing offer ID"}});
    }

    try {
        const offer = await Offer.findById(req.params.offerId);
        if (!offer) return res.status(404).json({message: "Offer not found"});

        if (offer.product_image?.public_id) {
            await cloudinary.uploader.destroy(offer.product_image.public_id);
        }

        await Offer.findByIdAndDelete(offer._id);
        res.status(200).json({message: "Offer deleted"});
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

// Update Offer
router.put("/offer/:offerId", isAuthenticated, async (req, res) => {
    const {error} = offerUpdateSchema.validate(req.fields);
    if (error) {
        return res.status(400).json({error: {message: error.details[0].message}});
    }

    try {
        const offer = await Offer.findById(req.params.offerId);
        if (!offer) return res.status(404).json({message: "Offer not found"});

        if (req.fields.title) offer.product_name = req.fields.title;
        if (req.fields.description) offer.product_description = req.fields.description;
        if (req.fields.price) offer.product_price = req.fields.price;

        offer.product_details.forEach((detail) => {
            const key = Object.keys(detail)[0];
            if (req.fields[key]) {
                detail[key] = req.fields[key];
            }
        });

        if (req.files?.picture?.path) {
            offer.product_image = await cloudinary.uploader.upload(req.files.picture.path, {
                public_id: offer._id,
                folder: "/vinted/offers/",
            });
        }

        await offer.save();
        res.status(200).json(offer);
    } catch (error) {
        res.status(400).json({error: {message: error.message}});
    }
});

module.exports = router;
