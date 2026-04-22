const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Free", "Plus", "Pro"],
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  durationDays: {
    type: Number,
    default: 30 // مدة الاشتراك
  },


  ccp: {
    type: String,
    default: ""
  },
  rip: {
    type: String,
    default: ""
  }

});

module.exports = mongoose.model("Plan", planSchema);