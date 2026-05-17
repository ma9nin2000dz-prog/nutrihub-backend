
const mongoose = require("mongoose");
const recommendationSchema = new mongoose.Schema({
  expert: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },

 mealType: {
    type: String,
    enum: ["breakfast", "lunch", "dinner", "snack"],
    required: true
  },

  servings: {
  type: Number,
  default: 1,
  min: 1
},

  note: { type: String },
}, { timestamps: true });

recommendationSchema.index(
  { patient: 1, recipe: 1, mealType: 1 },
  { unique: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);