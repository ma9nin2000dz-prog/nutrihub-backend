const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({

  action: String,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  date: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Activity", activitySchema);