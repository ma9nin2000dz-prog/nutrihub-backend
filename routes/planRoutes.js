const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");
const { protect, adminOnly } = require("../middleware/authMiddleware");

/////////////////////////////////////////////////////
// 📊 GET ALL PLANS (public)
/////////////////////////////////////////////////////
/*router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});*/
router.get("/", async (req, res) => {
  try {
    let plans = await Plan.find();

    // 🔥 إذا فارغة → ننشئ plans
    if (plans.length === 0) {
      plans = await Plan.insertMany([
        { name: "Free" },
        { name: "Plus" },
        { name: "Pro" }
      ]);
    }

    res.json(plans);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/////////////////////////////////////////////////////
// ✏️ UPDATE PLAN PRICE (admin)
/////////////////////////////////////////////////////
router.put("/:name", protect, adminOnly, async (req, res) => {
  try {
    
const { price, rip, ccp } = req.body;
    const plan = await Plan.findOneAndUpdate(
      { name: req.params.name },
      { price, rip, ccp },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;