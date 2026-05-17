const express = require("express");
const router = express.Router();
const Settings = require("../models/Settings");

// GET
router.get("/settings", async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      emailVerificationEnabled: true
    });
  }

  res.json(settings);
});

// PUT
router.put("/settings", async (req, res) => {
  const { emailVerificationEnabled } = req.body;

  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings({ emailVerificationEnabled });
  } else {
    settings.emailVerificationEnabled = emailVerificationEnabled;
  }

  await settings.save();

  res.json(settings);
});

module.exports = router;