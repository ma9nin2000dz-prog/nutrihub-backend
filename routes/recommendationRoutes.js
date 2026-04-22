const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const expertOnly = require("../middleware/expertMiddleware");

const Recommendation = require("../models/Recommendation");
const User = require("../models/user");/////////////////////////////
//////////////////////////////////////////////////////
// CREATE RECOMMENDATION (Expert Only)
//////////////////////////////////////////////////////
router.post("/", protect, expertOnly, async (req, res) => {
  try {

    const { patientId, recipeId, mealType, note,servings } = req.body;

   if (!mealType) {
  return res.status(400).json({ message: "mealType is required" });
}


    const recommendation = await Recommendation.create({
      expert: req.user._id,
      patient: patientId,
      recipe: recipeId,
      note,
      mealType,
      servings: servings || 1
    });

     /*await User.findByIdAndUpdate(
  patientId,
  {
    $push: {
      recommendations: { recipeId,mealType, servings: 1 }//////////////////////////////////////////////////////////////////////////////////////
    }
  }
);*/




    res.status(201).json(recommendation);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





//////////////////////////////////////////////////////
// GET MY RECOMMENDATIONS (Patient)
//////////////////////////////////////////////////////

/*router.get("/mine", protect, async (req, res) => {
  try {

    const { patientId } = req.query; // 🔥 مهم

    const recommendations = await Recommendation.find({
      patient: patientId || req.user._id
    })
    .populate({
      path: "recipe",
      populate: {
        path: "ingredients.product"
      }
    })
    .populate("expert", "name");

    //console.log("RECS:", recommendations);

    res.json(recommendations);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/
router.get("/mine", protect, async (req, res) => {
  try {
    const { patientId } = req.query;

    const recommendations = await Recommendation.find({
      patient: patientId || req.user._id
    })
    .populate({
      path: "recipe",
      populate: {
        path: "ingredients.product"
      }
    })
    .populate("expert", "name");

    // 🔥 CALCULATE PRICE
    const recsWithPrice = recommendations.map(rec => {

      const recipe = rec.recipe;

      let totalPrice = 0;

      recipe.ingredients.forEach(ing => {
        const product = ing.product;

        if (!product) return;

        // 🧠 price per gram
        const pricePerGram = (product.price || 0) / (product.quantity || 100);

        totalPrice += pricePerGram * ing.quantity;
      });

      return {
        ...rec.toObject(),
        recipe: {
          ...recipe.toObject(),
          price: Math.round(totalPrice) // 🔥 هنا تضيف price
        }
      };
    });

    res.json(recsWithPrice);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

///////////////delate recomendation patient /////////////////////

router.delete("/:id", protect, async (req, res) => {
  try {

    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({ message: "Recommendation not found" });
    }

    // 
    if (recommendation.patient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await recommendation.deleteOne();

    res.json({ message: "Recommendation deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//////////////////////////////////////
router.post("/remove", protect, async (req, res) => {
  try {
     //console.log("REMOVE HIT:", req.body); // 🔥 مهم
    const { patientId, recipeId, mealType } = req.body;/////////////////////////////////////////////////

 

// 2️⃣ 🔥 remove from Recommendation collection
await Recommendation.findOneAndDelete({
  patient: patientId,
  recipe: recipeId,
   mealType
});

    res.json({ message: "Removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/clear-patient", protect, async (req, res) => {
  try {

    const { patientId } = req.body;

    // 🔥 clear from User
    /*await User.findByIdAndUpdate(patientId, {
      $set: { recommendations: [] }
    });*/

    // 🔥 clear from Recommendation collection
    await Recommendation.deleteMany({
      patient: patientId
    });

    res.json({ message: "Patient recommendations cleared" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/////////////////////////////
router.put("/:id/servings", protect, async (req, res) => {
  try {
    const { servings } = req.body;

    const rec = await Recommendation.findByIdAndUpdate(
      req.params.id,
      { servings },
      //{ new: true }
      { returnDocument: "after" }
    );

    res.json(rec);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//////////////////////////////////////////////////////
// AUTO RECOMMENDATIONS (Genetic Algorithm)
//////////////////////////////////////////////////////
router.post("/auto", protect, async (req, res) => {
  try {
    const { patientId, recommendations } = req.body;

    if (!patientId || !recommendations) {
      return res.status(400).json({ message: "Missing data" });
    }

    const created = [];

    for (const rec of recommendations) {
      try {
        const newRec = await Recommendation.create({
          expert: req.user._id, // 👈 مهم
          patient: patientId,
          recipe: rec.recipe,
          mealType: rec.mealType,
          servings: rec.servings || 1
        });

        created.push(newRec);

      } catch (err) {
        // 🔥 ignore duplicate error (unique index)
        if (err.code !== 11000) {
          throw err;
        }
      }
    }

    res.json(created);

  } catch (error) {
    console.error("AUTO ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});





module.exports = router;