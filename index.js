const express = require("express");
const app = express();
const formidable = require("express-formidable");
app.use(formidable());
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
app.use(cors());

// Import routes
const userRoutes = require("./routes/users");
app.use(userRoutes);
const offerRoutes = require("./routes/offers");
app.use(offerRoutes);
const paymentRoutes = require("./routes/payment");
app.use(paymentRoutes);

mongoose.connect(process.env.MONGODB_URI);

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
