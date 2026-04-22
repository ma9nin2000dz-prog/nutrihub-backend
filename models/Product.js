





const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  barcode: {
    type: String,
    required: true,
    unique: true
  },

  brand: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  //////////////////////////////////////////
  // 💰 PRICE (FULL PACKAGE)
  //////////////////////////////////////////
  price: {
    type: Number,
    default: 0
  },

  //////////////////////////////////////////
  // 📦 PACKAGE SIZE
  //////////////////////////////////////////
  quantity: {
    type: Number,
    required: true, // مثلا 5000
  },

  //////////////////////////////////////////
  // ⚖️ UNIT
  //////////////////////////////////////////
  unit: {
    type: String,
    enum: ["g", "kg", "ml", "l"],
    default: "g"
  },

  //////////////////////////////////////////
  // 🥗 NUTRITION (PER 100g 🔥)
  //////////////////////////////////////////
  nutrition: {
    energyKcal: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    salt: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    nutritionScore: { type: Number, default: 0 },
    novaGroup: { type: Number, default: 0 }
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);