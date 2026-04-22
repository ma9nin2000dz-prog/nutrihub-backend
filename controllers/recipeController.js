const Recipe = require("../models/Recipe");
const Product = require("../models/Product");

const Activity = require("../models/Activity");

/////////////////////////////////////////////////////
// 🔢 FUNCTION TO CALCULATE NUTRITION
/////////////////////////////////////////////////////


//const calculateNutrition = async (ingredients) => {
const calculateNutrition = async (ingredients) => {

  // 🔥 هنا تحط الكود
  const productIds = ingredients.map(i => i.product);

  const products = await Product.find({
    _id: { $in: productIds }
  });

  const productMap = {};
  products.forEach(p => {
    productMap[p._id] = p;
  });

  // باقي الكود...
  let totalNutrition = {
    energyKcal: 0,
    carbohydrates: 0,
    sugar: 0,
    fat: 0,
    saturatedFat: 0,
    protein: 0,
    fiber: 0,
    magnesium: 0,
    calcium: 0,
    salt: 0,
    potassium: 0,
    sodium: 0,
  };

  let totalGrams = 0;
  let weightedScoreSum = 0;
  let highestNova = 0;

  for (let ing of ingredients) {

    //const product = await Product.findById(ing.product);
    const product = productMap[ing.product];
    if (!product || !product.nutrition) continue;

    const grams = Number(ing.quantity);
    totalGrams += grams;

    // 🔢 حساب العناصر العادية
    for (let key in totalNutrition) {

      if (key === "energyKcal") continue; 
      const valuePer100g = product.nutrition[key] || 0;
      totalNutrition[key] += (valuePer100g * grams) / 100;
    }

    // 🔥 Weighted nutritionScore
    const score = product.nutrition.nutritionScore || 0;
    weightedScoreSum += score * grams;

    // 🔥 Highest novaGroup
    const nova = product.nutrition.novaGroup || 0;
    if (nova > highestNova) {
      highestNova = nova;
    }
  }

  // ✅ نحسب المتوسط الوزني
  const nutritionScore =
    totalGrams > 0 ? weightedScoreSum / totalGrams : 0;
       // 🔥 FIX ENERGY (IMPORTANT)
const digestibleCarbs = Math.max(
  totalNutrition.carbohydrates - totalNutrition.fiber,
  0
);

totalNutrition.energyKcal =
  (totalNutrition.protein * 4) +
  (digestibleCarbs * 4) +
  (totalNutrition.fat * 9) +
  (totalNutrition.fiber * 2);


  return {
    ...totalNutrition,
    nutritionScore: Number(nutritionScore.toFixed(2)),
    novaGroup: highestNova,
  };
};

//////////creat


exports.createRecipe = async (req, res) => {
  try {

    console.log("CREATE RECIPE HIT");
    console.log("BODY:", req.body);
    console.log("INGREDIENTS RAW:", req.body.ingredients);

    console.log("SERVINGS:", req.body.servings);//////////////////////////////

    let ingredients = req.body.ingredients;

    // تحويل ingredients إذا جاءت من FormData
    if (typeof ingredients === "string") {
      ingredients = JSON.parse(ingredients);
    }

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({
        message: "Ingredients missing or invalid",
      });
    }

    const nutrition = await calculateNutrition(ingredients);

    console.log("NUTRITION CALCULATED:", nutrition);

    const image = req.file
  ? `/uploads/${req.file.filename}`
  : "https://via.placeholder.com/400";

    const recipe = await Recipe.create({
      ...req.body,
      ingredients,
      nutrition,
      image
    });

    await Activity.create({
      action: `Created recipe ${recipe.name}`,
      user: req.user.id
    });

    console.log("RECIPE SAVED:", recipe._id);

    res.status(201).json(recipe);

  } catch (error) {
    console.log("CREATE RECIPE ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};


/////////////////////////////////////////////////////
// GET ALL RECIPES (WITH SEARCH + FILTER + PAGINATION)
/////////////////////////////////////////////////////
exports.getRecipes = async (req, res) => {
  try {

    const {
      search,
      mealType,
      proteinMin,
      proteinMax,
      carbMin,
      carbMax,
      fatMin,
      fatMax
    } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    let filter = {};

    // 🔍 SEARCH BY NAME
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // 🔥 CATEGORY FILTER (مهم جدا)
        if (mealType) {
         filter.category = { $in: [mealType] };
          }
          
    // 🔎 Protein filter
    if (proteinMin || proteinMax) {
      filter["nutrition.protein"] = {};
      if (proteinMin)
        filter["nutrition.protein"].$gte = Number(proteinMin);
      if (proteinMax)
        filter["nutrition.protein"].$lte = Number(proteinMax);
    }

    // 🔎 Carbs filter
    if (carbMin || carbMax) {
      filter["nutrition.carbohydrates"] = {};
      if (carbMin)
        filter["nutrition.carbohydrates"].$gte = Number(carbMin);
      if (carbMax)
        filter["nutrition.carbohydrates"].$lte = Number(carbMax);
    }

    // 🔎 Fat filter
    if (fatMin || fatMax) {
      filter["nutrition.fat"] = {};
      if (fatMin)
        filter["nutrition.fat"].$gte = Number(fatMin);
      if (fatMax)
        filter["nutrition.fat"].$lte = Number(fatMax);
    }

    console.log("RECIPE FILTER:", filter);

    const total = await Recipe.countDocuments(filter);

    const recipes = await Recipe.find(filter)
      .populate("ingredients.product")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);




       /////////////prrice per ingridints/////////////////



const recipesWithPrice = recipes.map(recipe => {

  let totalPrice = 0;

  recipe.ingredients.forEach(ing => {

    const p = ing.product;

    /*if (p && p.quantity > 0) {

      const pricePerUnit = p.price / p.quantity;

      totalPrice += pricePerUnit * ing.quantity;

    }*/
   if (p && p.quantity && p.quantity > 0 && p.price) {

  const pricePerUnit = p.price / p.quantity;

  totalPrice += pricePerUnit * ing.quantity;

}

  });

  return {
    ...recipe.toObject(),
    price: Number(totalPrice.toFixed(2))
  };

});



res.json({
  page,
  totalPages: Math.ceil(total / limit),
  recipes: recipesWithPrice,
});






    /*res.json({
      page,
      totalPages: Math.ceil(total / limit),
      recipes,
    });*/

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// UPDATE RECIPE (RECALCULATE NUTRITION)
/////////////////////////////////////////////////////
exports.updateRecipe = async (req, res) => {
  try {

    console.log("UPDATE RECIPE HIT:", req.params.id);

    const nutrition = await calculateNutrition(req.body.ingredients);

    //////////////////////////////////////////////////
    // IMAGE UPDATE (NEW)
    //////////////////////////////////////////////////

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : req.body.image;

    //////////////////////////////////////////////////

    const updatedRecipe = await Recipe.findByIdAndUpdate(

      
      req.params.id,
      {
        ...req.body,
        nutrition,
         image,
      },
     { returnDocument: "after" }// { new: true }
    );
   if (updatedRecipe) {
  await Activity.create({
    action: `Updated recipe ${updatedRecipe.name}`,
    user: req.user.id
  });
}
    res.json(updatedRecipe);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// DELETE RECIPE
/////////////////////////////////////////////////////
exports.deleteRecipe = async (req, res) => {
  try {

    console.log("DELETE RECIPE HIT:", req.params.id);
    console.log("USER:", req.user);

  const recipe = await Recipe.findByIdAndDelete(req.params.id);

if (recipe) {
  await Activity.create({
    action: `Deleted recipe ${recipe.name}`,
    user: req.user.id
  });
}

    res.json({ message: "Recipe deleted" });

  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};