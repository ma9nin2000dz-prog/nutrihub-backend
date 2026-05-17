const Product = require("../models/Product");

// =======================================
// 🔹 GET PRODUCTS (Pagination + Filters)
// =======================================
const getProducts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;

    // Filters
    const {
      name,
      category,
      proteinMin,
      proteinMax,
      carbMin,
      carbMax,
      fatMin,
      fatMax
    } = req.query;

    let filter = {};

    // 🔹 Search by name
    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    // 🔹 Filter by category
    if (category) {
      filter.category = category;
    }

    // 🔹 Protein filter
    if (proteinMin || proteinMax) {
      filter["nutrition.protein"] = {};
      if (proteinMin) filter["nutrition.protein"].$gte = Number(proteinMin);
      if (proteinMax) filter["nutrition.protein"].$lte = Number(proteinMax);
    }

    // 🔹 Carbohydrates filter
     
    if (carbMin || carbMax) {
      filter["nutrition.carbohydrates"] = {};
      if (carbMin) filter["nutrition.carbohydrates"].$gte = Number(carbMin);
      if (carbMax) filter["nutrition.carbohydrates"].$lte = Number(carbMax);
    }

    // 🔹 Fat filter
    if (fatMin || fatMax) {
      filter["nutrition.fat"] = {};
      if (fatMin) filter["nutrition.fat"].$gte = Number(fatMin);
      if (fatMax) filter["nutrition.fat"].$lte = Number(fatMax);
    }

    // Count after filtering
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })//////////////////////////////////////
      .skip(startIndex)
      .limit(limit);

    res.json({
      totalProducts: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      products
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =======================================
// 🔹 GET PRODUCT BY BARCODE
// =======================================
const getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({
      barcode: req.params.barcode
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =======================================
// 🔹 EXPORT
// =======================================
module.exports = {
  getProducts,
  getProductByBarcode
};