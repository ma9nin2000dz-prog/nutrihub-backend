const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  email: String,

  plan: {
    type: String,
    enum: ["Free", "Plus", "Pro"]
  },

  amount: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);