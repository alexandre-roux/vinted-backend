const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    required: true,
    unique: true,
    type: String,
  },
  account: {
    username: String,
    phone: String,
    avatar: Object,
  },
  token: {
    required: true,
    type: String,
  },
  hash: {
    required: true,
    type: String,
  },
  salt: {
    required: true,
    type: String,
  },
});

module.exports = User;
