const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

router.post("/pay", async (req, res) => {
  // Réception du token créer via l'API Stripe depuis le Frontend
  const stripeToken = req.fields.stripeToken;
  const amount = Number(req.fields.amount) * 100;
  console.log(amount);
  const description = req.fields.description;

  // Créer la transaction
  const response = await stripe.charges.create({
    amount: amount,
    currency: "eur",
    description: description,

    // On envoie ici le token
    source: stripeToken,
  });
  console.log(response.status);

  // TODO
  // Sauvegarder la transaction dans une BDD MongoDB

  res.json(response);
});

module.exports = router;
