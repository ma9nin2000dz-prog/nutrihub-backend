
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Activity = require("../models/Activity");
const Settings = require("../models/Settings");
/////////////////////////////////////////////////////////
// 🔐 GENERATE TOKEN
/////////////////////////////////////////////////////////
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
///////////////////////////////////////////
const nodemailer = require("nodemailer");

const generateCode = () =>
  Math.floor(1000 + Math.random() * 9000).toString();
////////////////////////////////////////






exports.registerUser = async (req, res) => {
  console.log("REGISTER HIT 🔥"); 
  try {

    const { name, email, password, role, plan } = req.body;

    // 🔎 Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password",
      });
    }

    // 🔒 Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }


    //const code = generateCode();

    /////////////////////////////////////////////////////////
    // 🎯 ROLE LOGIC
    /////////////////////////////////////////////////////////

    const selectedRole =
      role === "expert" ? "expert" : "patient";

    /////////////////////////////////////////////////////////
    // 🎯 PLAN LOGIC
    /////////////////////////////////////////////////////////

    let selectedPlan = "Free";

    if (selectedRole === "expert") {
      // 🔥 Expert always Pro
      selectedPlan = "Pro";
    } else {
      const allowedPlans = ["Free", "Plus", "Pro"];
      selectedPlan = allowedPlans.includes(plan)
        ? plan
        : "Free";
    }

    /////////////////////////////////////////////////////////
    // 🎯 STATUS LOGIC
    /////////////////////////////////////////////////////////

    let status = "approved";

    // Plus & Pro require admin approval
    if (selectedPlan === "Plus" || selectedPlan === "Pro") {
      status = "pending";
    }

    // Expert always pending approval
    if (selectedRole === "expert") {
      status = "pending";
    }


     /////////////////////////////////////////////////////////
// 🎯 STATUS LOGIC (FIXED)
/////////////////////////////////////////////////////////






    /////////////////////////////////////////////////////////

 //const settings = await Settings.findOne();
 

//const isVerificationOn = settings?.emailVerificationEnabled ?? true;

let settings = await Settings.findOne();

if (!settings) {
  settings = await Settings.create({
    emailVerificationEnabled: true
  });
}

const isVerificationOn = settings.emailVerificationEnabled;
console.log("SETTINGS:", settings);
console.log("isVerificationOn:", isVerificationOn);

let userData = {
  name,
  email,
  password,
  role: selectedRole,
  plan: selectedPlan,
   paymentRequired:
    selectedPlan === "Free" ? false : true
};

let code = null;

if (isVerificationOn) {
  const generatedCode = generateCode();
  code = generatedCode;

  userData.verificationCode = generatedCode;
  userData.verificationExpires = Date.now() + 10 * 60 * 1000;
  userData.isVerified = false;
  userData.status = "not_verified";
} else {
  userData.isVerified = true;

  if (selectedPlan === "Free" && selectedRole === "patient") {
    userData.status = "approved";
  } else {
    userData.status = "pending";
  }
}



const user = await User.create(userData);

//////////////////////////////////
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

if (isVerificationOn) {
  await transporter.sendMail({
    to: email,
    subject: "Verification Code",
    text: `Your verification code is: ${code}`,
  });
}





     await Activity.create({
  action: `${selectedRole} ${user.name} registered`,
  user: user._id
});
   
    res.status(201).json({
  success: true,
  type: user.status, // 🔥 المفتاح الحقيقي
  message:
    user.status === "pending"
      ? "Account created. Waiting for admin approval."
      : "Verification code sent to email",
  plan: selectedPlan
});

  } catch (error) {

    console.log("REGISTER ERROR:", error);

    if (error.name === "ValidationError") {
      const firstError = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: firstError });
    }

    res.status(500).json({
      message: error.message || "Server error",
    });
  }
};
///////////////////////////////////////////

/////////////////////////////////////////////////////////
// ================= LOGIN =================
/////////////////////////////////////////////////////////
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");


   
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }
 console.log("PLAN DATE:", user.planEndDate);
console.log("PARSED:", new Date(user.planEndDate));
console.log("NOW:", new Date());






    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }//&& user.status !== "approved"




      if (!user.isVerified && user.role !== "admin" ) {
  return res.status(403).json({
    message: "Please verify your email first",
  });
}


// 🔥 تحقق من انتهاء الاشتراك
// 🔥 تحقق من انتهاء الاشتراك
/*if (user.planEndDate && user.planEndDate < Date.now()) {
  user.status = "pending";
  await user.save();

  return res.status(200).json({
    type: "expired_plan",
    email: user.email,
  });
}*/
if (
  (user.planEndDate && new Date(user.planEndDate) < new Date()) ||
  user.paymentRequired === true
) {
  return res.status(200).json({
    type: "payment_required",
    email: user.email,
  });
}






  
    /////////////////////////////////////////////////////////
    // 🔥 BLOCK LOGIN IF NOT APPROVED
    /////////////////////////////////////////////////////////

    if (user.status !== "approved") {
      return res.status(403).json({
        message: "Your account is waiting for admin approval.",
      });
    }

    /////////////////////////////////////////////////////////

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        status: user.status,
        plan: user.plan,
         email: user.email,          // 🔥 مهم
      phone: user.phone,
      requestedPlan: user.requestedPlan
      },
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};