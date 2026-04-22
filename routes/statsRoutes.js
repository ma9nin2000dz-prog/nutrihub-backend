/*const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

/////////////////////////////////////////////////////
// 📊 PROFIT STATS
/////////////////////////////////////////////////////
router.get("/profit", async (req, res) => {
  try {

    const payments = await Payment.find({ status: "approved" });

    const daily = {};
    let totalMonth = 0;
    let totalWeek = 0;

    const now = new Date();

    payments.forEach(p => {

      const date = new Date(p.createdAt);
      const key = date.toISOString().split("T")[0];

      // 🔥 daily
      daily[key] = (daily[key] || 0) + p.amount;

      // 🔥 monthly
      if (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      ) {
        totalMonth += p.amount;
      }

      // 🔥 weekly (last 7 days)
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) {
        totalWeek += p.amount;
      }

    });

    res.json({
      daily,
      totalMonth,
      totalWeek
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;*/



const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");

/////////////////////////////////////////////////////
// 📊 PROFIT STATS + GROWTH
/////////////////////////////////////////////////////
router.get("/profit", async (req, res) => {
  try {

    const payments = await Payment.find({ status: "approved" });

    const daily = {};
    let totalMonth = 0;
    let totalWeek = 0;

    let lastWeek = 0;
    let lastMonth = 0;

    const now = new Date();

const prevMonth = new Date(now);
      prevMonth.setMonth(now.getMonth() - 1);


    payments.forEach(p => {

      const date = new Date(p.createdAt);
      const key = date.toISOString().split("T")[0];

      //////////////////////////////////////////////////
      // 🔥 DAILY
      //////////////////////////////////////////////////
      daily[key] = (daily[key] || 0) + p.amount;

      //////////////////////////////////////////////////
      // 🔥 MONTHLY (current month)
      //////////////////////////////////////////////////
      if (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      ) {
        totalMonth += p.amount;
      }

      //////////////////////////////////////////////////
      // 🔥 WEEKLY (last 7 days)
      //////////////////////////////////////////////////
      const diffDays = (now - date) / (1000 * 60 * 60 * 24);

      if (diffDays <= 7) {
        totalWeek += p.amount;
      }

      //////////////////////////////////////////////////
      // 🔥 LAST WEEK (7 → 14 days)
      //////////////////////////////////////////////////
      if (diffDays > 7 && diffDays <= 14) {
        lastWeek += p.amount;
      }

      //////////////////////////////////////////////////
      // 🔥 LAST MONTH
      //////////////////////////////////////////////////
      

      if (
        date.getMonth() === prevMonth.getMonth() &&
        date.getFullYear() === prevMonth.getFullYear()
      ) {
        lastMonth += p.amount;
      }

    });

    //////////////////////////////////////////////////
    // ✅ RESPONSE
    //////////////////////////////////////////////////
    res.json({
      daily,
      totalMonth,
      totalWeek,
      lastWeek,
      lastMonth
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;