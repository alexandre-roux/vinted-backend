const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", {
  stripeID: String,
  date: Number,
  amount: Number,
  product_name: String,
  card: {
    brand: String,
    country: String,
    exp_month: Number,
    exp_year: Number,
  },
});

module.exports = Transaction;
