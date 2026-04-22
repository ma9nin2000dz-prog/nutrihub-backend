/*const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

/////////////////////////////////////////////////////
// 🔐 AUTH ROUTES
/////////////////////////////////////////////////////

router.post("/register", registerUser);
router.post("/login", loginUser);


module.exports = router;*/

const express = require("express");
const router = express.Router();

const User = require("../models/User"); // ✅ مهم

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

/////////////////////////////////////////////////////
// 🔐 AUTH ROUTES
/////////////////////////////////////////////////////

router.post("/register", registerUser);
router.post("/login", loginUser);

///////////////////////////////


/////////////////////////////////////////////////////
// ✅ VERIFY CODE
/////////////////////////////////////////////////////

router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  try {
    //const user = await User.findOne({ email });
const user = await User.findOne({
  $or: [
    { email },
    { pendingEmail: email }
  ]
});


    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /*if (user.isVerified) {
      return res.json({ message: "Already verified" });
    }*/
   if (user.isVerified && !user.pendingEmail) {
  return res.json({ message: "Already verified" });
}

    if (user.verificationExpires < Date.now()) {
      return res.status(400).json({ message: "Code expired" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid code" });
    }

/////////////////////////////////////////////////////
/*if (user.pendingEmail) {
  user.email = user.pendingEmail;
  user.pendingEmail = null;
}*/
// بعد التحقق من الكود مباشرة
if (
  user.pendingEmail &&
  user.pendingEmail.toLowerCase().trim() === email.toLowerCase().trim()
) {
  console.log("EMAIL CHANGE DETECTED ✅");

  user.email = user.pendingEmail;
  user.pendingEmail = null;
}


//////////////////////////////







    user.isVerified = true;

    if (user.plan === "Free" && user.role === "patient") {
  user.status = "approved"; 
} else {
  user.status = "pending"; // يحتاج admin
}

    user.verificationCode = null;
    user.verificationExpires = null;

    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;