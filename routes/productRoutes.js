

const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const proOnly = require("../middleware/proMiddleware");
const Product = require("../models/Product");

const Activity = require("../models/Activity");
// =====================================================
// ================== ADMIN GET ========================
// =====================================================
router.get("/", protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      name,
      proteinMin,
      proteinMax,
      carbMin,
      carbMax,
      fatMin,
      fatMax
    } = req.query;

    let filter = {};

    // 🔎 Search by name
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

   // 🔎 Protein
if (proteinMin || proteinMax) {
  filter["nutrition.protein"] = {};
  if (proteinMin)
    filter["nutrition.protein"].$gte = Number(proteinMin);
  if (proteinMax)
    filter["nutrition.protein"].$lte = Number(proteinMax);
}

// 🔎 Carbs
if (carbMin || carbMax) {
  filter["nutrition.carbohydrates"] = {};
  if (carbMin)
    filter["nutrition.carbohydrates"].$gte = Number(carbMin);
  if (carbMax)
    filter["nutrition.carbohydrates"].$lte = Number(carbMax);
}

// 🔎 Fat
if (fatMin || fatMax) {
  filter["nutrition.fat"] = {};
  if (fatMin)
    filter["nutrition.fat"].$gte = Number(fatMin);
  if (fatMax)
    filter["nutrition.fat"].$lte = Number(fatMax);
}
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// =====================================================
// ================== PRO GET (Advanced) ===============
// =====================================================
router.get("/pro", protect, proOnly, async (req, res) => {
  try {
    const {
      name,
      minProtein,
      maxProtein,
      minCarbs,
      maxCarbs,
      minFat,
      maxFat
    } = req.query;

    let filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

 // 🔎 Protein
    if (minProtein || maxProtein) {
      filter["nutrition.protein"] = {};
      if (minProtein)
        filter["nutrition.protein"].$gte = Number(minProtein);
      if (maxProtein)
        filter["nutrition.protein"].$lte = Number(maxProtein);
    }

    // 🔎 Carbs
    if (minCarbs || maxCarbs) {
      filter["nutrition.carbohydrates"] = {};
      if (minCarbs)
        filter["nutrition.carbohydrates"].$gte = Number(minCarbs);
      if (maxCarbs)
        filter["nutrition.carbohydrates"].$lte = Number(maxCarbs);
    }

    // 🔎 Fat
    if (minFat || maxFat) {
      filter["nutrition.fat"] = {};
      if (minFat)
        filter["nutrition.fat"].$gte = Number(minFat);
      if (maxFat)
        filter["nutrition.fat"].$lte = Number(maxFat);
    }

    const products = await Product.find(filter);

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.post("/", protect, adminOnly, async (req, res) => {
  try {

    const product = new Product({
      barcode: req.body.barcode,
      brand: req.body.brand,
      name: req.body.name,
      price: Number(req.body.price),

      nutrition: req.body.nutrition,
         quantity: Number(req.body.quantity), ///////////////// for add product from product
      nutritionScore: Number(req.body.nutritionScore),
      novaGroup: Number(req.body.novaGroup),
    });

    const saved = await product.save();

     //  تسجيل Activity///////////////////////////////////////////////////////////
    await Activity.create({
      action: `Created product ${saved.name}`,
      user: req.user._id
    });



    res.status(201).json(saved);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



router.put("/:id", protect, adminOnly, async (req, res) => {
  try {

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after" }
    );
    

         await Activity.create({///////////////////////////////////////////////////
      action: `Updated product ${updated.name}`,
      user: req.user._id
    });






    res.json(updated);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});






router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Activity.create({
      action: `Deleted product ${product.name}`,
      user: req.user._id
    });

    res.json({ message: "Deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;