const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  emailVerificationEnabled: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Settings", settingsSchema);