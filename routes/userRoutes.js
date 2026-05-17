const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { removePatient } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const User = require("../models/user");



const { getMe,
   updateProfile,
   saveDietHistory   ,
   calculateTDEE,
  addToDiet,
  checkUsername
 } = require("../controllers/userController");



const {
  getAllPatients,
  deletePatient,
  getAllExperts,
  deleteExpert,
  approveExpert,
  updateUserPlan,
  createExpert,
  createPatient,
  approvePatient,
    getLatestUsers,///////////////////
  getPendingUsers,///////////////
  approveUser,/////////////////
} = require("../controllers/userController");

/////////////////////////////////////////////////////
// 🔐 ADMIN PATIENT MANAGEMENT
/////////////////////////////////////////////////////

router.get("/patients", protect, adminOnly, getAllPatients);
router.delete("/patients/:id", protect, adminOnly, deletePatient);
router.post("/patients", protect, adminOnly, createPatient);


router.post("/diet-history", protect, saveDietHistory);

router.post("/diet/add", protect, addToDiet);

router.get("/latest", protect, adminOnly, getLatestUsers);

router.get("/pending", protect, adminOnly, getPendingUsers);

router.put("/approve/:id", protect, adminOnly, approveUser);
/////////////////////////////////////////////////////
// 🔐 ADMIN EXPERT MANAGEMENT
/////////////////////////////////////////////////////

router.get("/experts", protect, adminOnly, getAllExperts);
router.delete("/experts/:id", protect, adminOnly, deleteExpert);
router.put("/experts/:id/approve", protect, adminOnly, approveExpert);
router.post("/experts", protect, adminOnly, createExpert);


router.get("/check-username", checkUsername);
/////////////////////////////////////////////////////
// 🔄 UPDATE USER PLAN
/////////////////////////////////////////////////////

router.put("/:id/plan", protect, adminOnly, updateUserPlan);
router.put(
  "/patients/:id/approve",
  protect,
  adminOnly,
  approvePatient
);
/////////////////////////////////////////////////
// 🔴 REJECT PAYMENT
router.put("/payment-reject/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.paymentRequired = true; // 🔥 يرجع يطلب الدفع

    await user.save();

    res.json({ message: "User must repay ✔" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/////////////////////////////////////////////////////
// 👤 GET CURRENT LOGGED USER
/////////////////////////////////////////////////////
router.get("/tdee", protect, calculateTDEE);



router.get("/me", protect, async (req, res) => {
  try {

    const user = await User.findById(req.user._id)
      .populate("expert", "name email photo")
      .populate("patients", "name email")
      .populate({
  path: "dietHistory.recipes",
  populate: {
    path: "recipeId",
    model: "Recipe"
  }
})
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});



/////////////////////////////////////////////////////
// 👨‍⚕️ GET ALL EXPERTS (FOR PATIENT TO CHOOSE)
/////////////////////////////////////////////////////

router.get("/public-experts", protect, async (req, res) => {
  try {
    const experts = await User.find({
      role: "expert",
      status: "approved"
    }).select("name email photo patients");

    res.json(experts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/////////////////////////////////////////////////////
// 🩺 PATIENT CHOOSES EXPERT
/////////////////////////////////////////////////////

router.put("/choose-expert", protect, async (req, res) => {
  try {
    const { expertId } = req.body;

    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can choose expert" });
    }

    const expert = await User.findById(expertId);

    if (!expert || expert.role !== "expert") {
      return res.status(404).json({ message: "Expert not found" });
    }

    const patient = await User.findById(req.user._id);

   


     const oldExpertId = patient.expert;

patient.expert = new mongoose.Types.ObjectId(expertId);
patient.isAccepted = false; // 🔥 يرجع waiting

await patient.save();

// 🔥 نحذفو من expert القديم
if (oldExpertId) {
  const oldExpert = await User.findById(oldExpertId);

  if (oldExpert) {
    oldExpert.patients = oldExpert.patients.filter(
      id => id.toString() !== patient._id.toString()
    );

    await oldExpert.save();
  }
}






    res.json({ message: "Expert selected successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/update-disease", protect, async (req, res) => {

  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Only patient allowed" });
  }

  const { chronicDisease } = req.body;

  const user = await User.findById(req.user._id);
  user.chronicDisease = chronicDisease;
  await user.save();

  res.json({ message: "Disease updated successfully" });

});
///////////////////////////////////////////
const upload = require("../middleware/upload");

router.post("/upload-photo", protect, upload.single("photo"), async (req, res) => {

  try {

    const user = await User.findById(req.user._id);

    user.photo = "/uploads/" + req.file.filename;

    await user.save();

    res.json({
      photo: user.photo
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

});
//////////////////////////photo////////////////
router.put("/update-photo", protect, async (req, res) => {
  try {

    const user = await User.findById(req.user._id);

    user.photo = req.body.photo;

    await user.save();

    res.json({
      message: "Photo updated",
      photo: user.photo
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
/////////////////////////////////////////////////////////////////////////////////
router.put("/profile", protect, updateProfile);

/////////////////////////
router.put("/accept-patient", protect, async (req, res) => {
  try {

    const { patientId } = req.body;

    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    ////////////////////////////////////////////////////
    // ربط المريض بالخبير
    ////////////////////////////////////////////////////

    patient.expert = req.user._id;
    patient.isAccepted = true;

    await patient.save();

    ////////////////////////////////////////////////////
    // إضافة المريض لقائمة الخبير
    ////////////////////////////////////////////////////

    const expert = await User.findById(req.user._id);

    if (!expert.patients.includes(patient._id)) {
      expert.patients.push(patient._id);
      await expert.save();
    }

    ////////////////////////////////////////////////////

    res.json({ message: "Patient accepted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

///////////////////////////////////
router.delete("/delete-user/:email", async (req, res) => {
  try {
    const { email } = req.params;

   /* await User.deleteOne({
      email,
      status: "pending"
    });*/
    await User.deleteOne({
  email,
  status: { $in: ["pending", "not_verified"] }
});

    res.json({ message: "User deleted ✔" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;