const express = require("express");
const router = express.Router();

const {
  createRecipe,
  getRecipes,
  updateRecipe,
  deleteRecipe,
} = require("../controllers/recipeController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");


router.post(
 "/",
 protect,
 adminOnly,
 upload.single("image"),
 createRecipe
);
router.get("/", protect,  getRecipes);
router.put(
 "/:id",
 protect,
 adminOnly,
 upload.single("image"),
 updateRecipe
);
router.delete("/:id", protect, adminOnly, deleteRecipe);



module.exports = router;