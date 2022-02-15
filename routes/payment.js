const express = require("express");
const Offer = require("../models/Offer");
const { v2: cloudinary } = require("cloudinary");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

router.post("/pay", async (req, res) => {
  try {
    // Réception du token créer via l'API Stripe depuis le Frontend
    const stripeToken = req.fields.stripeToken;
    const amount = Number(req.fields.amount) * 100;
    const description = req.fields.description;

    // Créer la transaction
    const response = await stripe.charges.create({
      amount: amount,
      currency: "eur",
      description: description,

      // On envoie ici le token
      source: stripeToken,
    });

    const newTransaction = new Transaction({
      stripeID: response.id,
      date: response.created,
      amount: amount,
      product_name: description,
      card: {
        brand: response.payment_method_details.card.brand,
        country: response.payment_method_details.card.country,
        exp_month: response.payment_method_details.card.exp_month,
        exp_year: response.payment_method_details.card.exp_year,
      },
    });
    await newTransaction.save();

    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

module.exports = router;
