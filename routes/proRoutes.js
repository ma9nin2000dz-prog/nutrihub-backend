const express = require("express");
const router = express.Router();
//const protect = require("../middleware/authMiddleware");

const { protect } = require("../middleware/authMiddleware");
const proOnly = require("../middleware/proMiddleware");
router.post("/calculate-tdee", protect, proOnly, async (req, res) => {
  try {
    const { gender, age, height, weight, activityLevel } = req.body;

    let BMR;

    if (gender === "male") {
      BMR = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      BMR = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMap = {
      Sedentary: 1.2,
      Light: 1.375,
      Moderate: 1.55,
      Active: 1.725,
      VeryActive: 1.9,
    };

    const factor = activityMap[activityLevel];

    const TDEE = BMR * factor;

    res.json({
      BMR: Math.round(BMR),
      TDEE: Math.round(TDEE),
      cutting_calories: Math.round(TDEE - 500),
      bulking_calories: Math.round(TDEE + 500),
      maintenance_calories: Math.round(TDEE),
      advice:
        "Adjust calories gradually based on progress and consult a professional if needed.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;