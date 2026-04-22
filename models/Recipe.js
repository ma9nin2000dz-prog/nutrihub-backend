const mongoose = require("mongoose");

/////////////////////////////////////////////////////
// NUTRITION SCHEMA
/////////////////////////////////////////////////////
const nutritionSchema = new mongoose.Schema({
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
  novaGroup: { type: Number, default: 0 },
});

/////////////////////////////////////////////////////
// RECIPE SCHEMA
/////////////////////////////////////////////////////
const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

     image: {
      type: String,
      default: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    },



    category: {
  type: [String],
  enum: ["breakfast", "lunch", "dinner", "snack"],
  default: []
},
   
    preparation_time: Number,
    preparation_tools: String,
    description: String,
     difficulty: {
  type: String,
  enum: ["easy", "medium", "hard"],
  default: "easy",
},




    servings: {
  type: Number,
  required: true,
  default: 1,
},

    /////////////////////////////////////////////////////
    // 🔥 INGREDIENTS (linked to Product)
    /////////////////////////////////////////////////////
    ingredients: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number, // grams
          required: true,
        },
      },
    ],


    /////////////////////////////////////////////////////
    // AUTO CALCULATED NUTRITION
    /////////////////////////////////////////////////////
    nutrition: nutritionSchema,

    //price: Number, // DA
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", recipeSchema);