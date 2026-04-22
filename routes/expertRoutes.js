/*const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const User = require("../models/user");


/////////////////////////////////////////////////////
// DELETE PATIENT (remove from expert)
/////////////////////////////////////////////////////

router.delete("/patients/:id", protect, async (req, res) => {
  try {

    if (req.user.role !== "expert") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const patientId = req.params.id;

    await User.findByIdAndUpdate(
      patientId,
      { $unset: { expert: "" } } // remove expert link
    );

    res.json({ message: "Patient removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// GET all patients who chose this expert
router.get("/patients", protect, async (req, res) => {
  try {

    // تأكد أنه خبير
    if (req.user.role !== "expert") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ابحث عن المرضى الذين expert = هذا الخبير
    const patients = await User.find({
      role: "patient",
      expert: req.user._id//.toString()
    })      
 

.populate({
  path: "recommendations.recipeId",
  populate: {
    path: "ingredients.product"
  }
});
    res.json(patients);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;*/


const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const User = require("../models/user");
const Recommendation = require("../models/Recommendation"); // 🔥 مهم

/////////////////////////////////////////////////////
// DELETE PATIENT
/////////////////////////////////////////////////////
router.delete("/patients/:id", protect, async (req, res) => {
  try {

    if (req.user.role !== "expert") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const patientId = req.params.id;

    await User.findByIdAndUpdate(
      patientId,
      { $unset: { expert: "" } }
    );

    res.json({ message: "Patient removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/////////////////////////////////////////////////////
// GET PATIENTS + THEIR MEALS 🔥
/////////////////////////////////////////////////////
router.get("/patients", protect, async (req, res) => {
  try {

    if (req.user.role !== "expert") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 1️⃣ المرضى
    const patients = await User.find({
      role: "patient",
      expert: req.user._id
    });

    // 2️⃣ التوصيات
    const recommendations = await Recommendation.find({
      expert: req.user._id
    }).populate({
      path: "recipe",
      populate: {
        path: "ingredients.product"
      }
    });

    // 3️⃣ ربطهم
    const result = patients.map(p => {

      const patientMeals = recommendations.filter(r =>
        r.patient.toString() === p._id.toString()
      );

      return {
        ...p.toObject(),
        recommendations: patientMeals
      };
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;