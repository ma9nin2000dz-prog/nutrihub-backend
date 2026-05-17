const User = require("../models/user");
const Activity = require("../models/Activity");
const Recipe = require("../models/Recipe");

const Payment = require("../models/Payment");
const Plan = require("../models/Plan");

const Settings = require("../models/Settings");
/////////////////////////////////////////////////////
// GET ALL PATIENTS
/////////////////////////////////////////////////////
exports.getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 5 } = req.query;

    let query = { role: "patient" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const total = await User.countDocuments(query);

    const patients = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      
      
    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      patients,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// DELETE PATIENT
/////////////////////////////////////////////////////
exports.deletePatient = async (req, res) => {
  try {
    console.log("DELETE PATIENT HIT:", req.params.id);

    const user = await User.findById(req.params.id);

    if (!user || user.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }

    await user.deleteOne();
    
    await Activity.create({
      action: `Admin deleted patient ${user.name}`,
      user: req.user.id
    });

    res.json({ message: "Patient deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/////////////////////////////////////////////////////
// 🔥 CREATE PATIENT (ADMIN)
/////////////////////////////////////////////////////



exports.createPatient = async (req, res) => {
  try {
    console.log("CREATE PATIENT"); // ✅ فقط هذا

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const patient = await User.create({
      name,
      email,
      password,
      role: "patient",
      plan: "Free",
      status: "approved",
    });
    await Activity.create({
  action: `Admin created patient ${patient.name}`,
  user: req.user.id
});

    res.status(201).json({
      message: "Patient created successfully",
      patient,
    });

  } catch (error) {
    console.log("CREATE PATIENT ERROR");
    res.status(500).json({
      message: error.message,
    });
  }
};
/////////////////////////////////////////////////////
// GET ALL EXPERTS
/////////////////////////////////////////////////////
exports.getAllExperts = async (req, res) => {
  try {
    const { search, page = 1, limit = 5 } = req.query;

    let query = { role: "expert" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const total = await User.countDocuments(query);

    const experts = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      experts,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// DELETE EXPERT
/////////////////////////////////////////////////////
exports.deleteExpert = async (req, res) => {
  try {
    console.log("DELETE EXPERT HIT:", req.params.id);

    const user = await User.findById(req.params.id);

    if (!user || user.role !== "expert") {
      return res.status(404).json({ message: "Expert not found" });
    }

    await user.deleteOne();

await Activity.create({
  action: `Admin deleted expert ${user.name}`,
  user: req.user.id
});




    res.json({ message: "Expert deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// APPROVE EXPERT
/////////////////////////////////////////////////////
exports.approveExpert = async (req, res) => {
  try {
    console.log("APPROVE EXPERT HIT:", req.params.id);

    const user = await User.findById(req.params.id);

    if (!user || user.role !== "expert") {
      return res.status(404).json({ message: "Expert not found" });
    }

    user.status = "approved";
    user.plan = "Pro";


const now = new Date();

user.planEndDate = new Date(
  now.setMonth(now.getMonth() + 1)
);

user.paymentRequired = false;


    await user.save();

    await Activity.create({
  action: `Admin approved expert ${user.name}`,
  user: req.user.id
});

    res.json({ message:"Expert approved and upgraded to Pro", user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



////////////////////////////////////////////////////
// UPDATE USER PLAN
////////////////////////////////////////////////////
exports.updateUserPlan = async (req, res) => {
  try {
    console.log("UPDATE PLAN HIT:", req.params.id);

    const { plan } = req.body;
    const allowedPlans = ["Free", "Plus", "Pro"];

    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    ////////////////////////////////////////////////////
    //  منع تعديل خطة Expert
    ////////////////////////////////////////////////////
    if (user.role === "expert") {
      return res.status(400).json({
        message: "Expert plan cannot be modified",
      });
    }

    ////////////////////////////////////////////////////
    //  تحديث الخطة
    ////////////////////////////////////////////////////
    user.plan = plan;
    user.requestedPlan = null;

    ////////////////////////////////////////////////////
// 🔥 ADD PAYMENT (PROFIT)
////////////////////////////////////////////////////

    //  تحديث الحالة حسب الخطة
    ////////////////////////////////////////////////////
    if (plan === "Free") {
      user.status = "approved";
    } else {
      user.status = "pending"; // Plus أو Pro تحتاج موافقة
    }

    await user.save();

    await Activity.create({
  action: `Admin updated plan for ${user.name} to ${user.plan}`,
  user: req.user.id
});

    res.json({
      message: "Plan updated successfully",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        plan: user.plan,
        status: user.status,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/////////////////////////////////////////////////////
// CREATE EXPERT
/////////////////////////////////////////////////////
exports.createExpert = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "User exists" });
    }

    const expert = await User.create({
      name,
      email,
      password,
      role: "expert",
      plan: "Free",
      status: "pending",
    });
        await Activity.create({
      action: `Admin created expert ${expert.name}`,
      user: req.user.id
    });

    res.status(201).json({ message: "Expert created", expert });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/////////////////////////////////////////////////////
// APPROVE PATIENT
/////////////////////////////////////////////////////
exports.approvePatient = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    if (user.role !== "patient") {
      return res.status(400).json({
        message: "Not a patient account"
      });
    }

    //user.status = "approved";
    //await user.save();



    user.status = "approved";

const now = new Date();

// 🔥 تحديث تاريخ الاشتراك
if (user.plan === "Pro" || user.plan === "Plus") {
  user.planEndDate = new Date(
    now.setMonth(now.getMonth() + 1)
  );
}

await user.save();







//////////////////////////////////////////////////////
// 🔥 UPDATE PAYMENT (IMPORTANT)
//////////////////////////////////////////////////////
const payment = await Payment.findOne({
  email: user.email,
  status: "pending"
}).sort({ createdAt: -1 });

if (payment) {
  const planData = await Plan.findOne({ name: user.plan });

  payment.status = "approved";
  payment.amount = planData?.price || 0;

  await payment.save();
}






    await Activity.create({
  action: `Admin approved patient ${user.name}`,
  user: req.user.id
});

    res.json({
      message: "Patient approved successfully"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



/////////////////////////////////////////////////////
// GET LATEST USERS
/////////////////////////////////////////////////////
exports.getLatestUsers = async (req, res) => {

  try {

    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(users);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

//////////////////pending user////////////////////
exports.getPendingUsers = async (req,res)=>{

 const users = await User.find({status:"pending"});

 res.json(users);

};

/////////////aprove user
exports.approveUser = async (req,res)=>{

 const user = await User.findById(req.params.id);

 user.status = "approved";

 await user.save();

 res.json(user);

};

////////////////////////////////////////////////////
// GET CURRENT USER PROFILE
////////////////////////////////////////////////////

exports.getMe = async (req,res)=>{
try{

const user = await User.findById(req.user.id)
  .populate("expert","name email")
  .populate("patients","name email")
  .populate({
    path: "dietHistory.recipes.recipeId",
    model: "Recipe"
  });

console.log("POPULATED DIET:",JSON.stringify(user.dietHistory,null,2));

res.json(user);

}catch(error){
res.status(500).json({message:error.message});
}
};


////////////////////////////////////////////////////
// UPDATE PROFILE
////////////////////////////////////////////////////
exports.updateProfile = async (req,res)=>{

try{

//const user = await User.findById(req.user.id);
const user = await User.findById(req.user._id);
if(!user){
return res.status(404).json({message:"User not found"});
}
/////////////////////////////
const { name,email, phone, password } = req.body;
if (name) user.name = name;
// 🔥 تحديث البيانات الأساسية
//if (email) user.email = email;
///////////////////////////////////




// 🔥 check verification mode
if (email && email !== user.email) {

  const settings = await Settings.findOne();
  const isVerificationOn = settings?.emailVerificationEnabled ?? true;

  if (isVerificationOn) {
    // 🔐 verification ON

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    user.pendingEmail = email;
    user.verificationCode = code;
    user.verificationExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    // 📩 send email
    const transporter = require("nodemailer").createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Verify your new email",
      text: `Your verification code is: ${code}`,
    });

    return res.json({
      type: "email_change_requested",
      message: "Please verify your new email",
    });

  } else {
    // 🔥 verification OFF → direct change
    user.email = email;
  }
}








////////////////////////
if (phone) user.phone = phone;

// 🔐 فقط إذا موجود
if (password && password.trim() !== "") {
  user.password = password;
};

if (req.body.requestedPlan) {
  user.requestedPlan = req.body.requestedPlan;
}
//////////////////////////////////////////////////
// TRACK WEIGHT CHANGE
//////////////////////////////////////////////////

if(req.body.weight && req.body.weight != user.weight){




await User.findByIdAndUpdate(req.user.id, {
  $push: {
    weightHistory: {
      $each: [
        {
          weight: Number(req.body.weight),
          date: new Date()
        }
      ],
      $slice: -35
    }
  }
});


}

//////////////////////////////////////////////////

user.age = req.body.age ?? user.age;
user.height = req.body.height ?? user.height;
user.weight = req.body.weight ?? user.weight;
user.gender = req.body.gender ?? user.gender;
user.activityLevel = req.body.activityLevel ?? user.activityLevel;
user.chronicDisease = req.body.chronicDisease ?? user.chronicDisease;
user.photo = req.body.photo ?? user.photo;


user.goalType = req.body.goalType ?? user.goalType;
user.goalCalories = req.body.goalCalories ?? user.goalCalories;
user.macros = req.body.macros ?? user.macros;
user.dailyBudget = req.body.dailyBudget ?? user.dailyBudget;
await user.save();

res.json(user);

}catch(error){

res.status(500).json({message:error.message});

}

};

////////////////////////////////////////////////////
// SAVE DIET HISTORY
////////////////////////////////////////////////////
exports.saveDietHistory = async (req,res)=>{

try{

const user = await User.findById(req.user.id);

if(!user){
return res.status(404).json({message:"User not found"});
}

const { recipes,totalCalories,totalPrice } = req.body;

/*user.dietHistory.push({
recipes,
totalCalories,
totalPrice,
date:new Date()/// yastock bla limit
});
                          
await user.save();*/

/*await User.findByIdAndUpdate(req.user.id, {
  $push: {
    dietHistory: {
      $each: [
        {
          recipes,
          totalCalories,
          totalPrice,
          date: new Date()
        }
      ],
      $slice: -30
    }
  }
});



res.json({
message:"Diet saved",
diet:user.dietHistory
});*/
const updatedUser = await User.findByIdAndUpdate(
  req.user.id,
  {
    $push: {
      dietHistory: {
        $each: [
          {
            recipes,
            totalCalories,
            totalPrice,
            date: new Date()
          }
        ],
        $slice: -30
      }
    }
  },
  { new: true }
);

res.json({
  message: "Diet saved",
  diet: updatedUser.dietHistory
});

}catch(error){

res.status(500).json({message:error.message});

}

};
////////////////////////////////////////////////////
// CALCULATE TDEE
////////////////////////////////////////////////////
exports.calculateTDEE = async (req,res)=>{

try{

const user = await User.findById(req.user.id);

if(!user){
return res.status(404).json({message:"User not found"});
}

const { weight,height,age,activityLevel,gender } = user;

if(!weight || !height || !age){
return res.json({message:"Missing data"});
}

//////////////////////////////////////////////////
// BMR
//////////////////////////////////////////////////

let bmr;

if(gender === "female"){
bmr = 10*weight + 6.25*height - 5*age - 161;
}else{
bmr = 10*weight + 6.25*height - 5*age + 5;
}

//////////////////////////////////////////////////
// ACTIVITY MULTIPLIER
//////////////////////////////////////////////////

const activityMap = {
Sedentary:1.2,
Light:1.375,
Moderate:1.55,
Active:1.725,
VeryActive:1.9
};

const multiplier = activityMap[activityLevel] || 1.2;

const maintenance = Math.round(bmr * multiplier);

//////////////////////////////////////////////////
// RESULTS
//////////////////////////////////////////////////

const result = {

bmr:Math.round(bmr),

maintenance_calories:maintenance,

cutting_calories:Math.round(maintenance * 0.8),

bulking_calories:Math.round(maintenance * 1.15)

};

res.json(result);

}catch(error){

res.status(500).json({message:error.message});

}

};


////////////////////////////////////////////////////
// ADD TO DIET (🔥 NEW)
////////////////////////////////////////////////////
exports.addToDiet = async (req, res) => {
  try {

    const { recipeId, mealType, servings } = req.body;

if (!recipeId) {
  return res.status(400).json({ message: "recipeId is required" });
}


    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    ////////////////////////////////////////////////////
    // 🔥 create diet structure if not exists
    ////////////////////////////////////////////////////
    if (!user.diet) {
      user.diet = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };
    }

    ////////////////////////////////////////////////////
    // 🔥 remove recipe from ALL categories (avoid duplicate)
    ////////////////////////////////////////////////////
    Object.keys(user.diet).forEach(cat => {
  user.diet[cat] = user.diet[cat].filter(r => {
    if (!r?.recipeId) return false; // 🔥 يحذف الداتا الفاسدة
    return r.recipeId.toString() !== recipeId;
  });
});

    ////////////////////////////////////////////////////
    // 🔥 add to selected category
    ////////////////////////////////////////////////////
    const category = mealType || "lunch";

    user.diet[category].push({
      recipeId,
      servings: servings || 1
    });

    await user.save();

    res.json({ message: "Meal added to diet", diet: user.diet });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/////////////////////////////////////////////////////
// CHECK USERNAME AVAILABILITY
/////////////////////////////////////////////////////
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.trim().length < 3) {
      return res.json({ available: false });
    }

    const existingUser = await User.findOne({
      name: { $regex: `^${username}$`, $options: "i" } // 🔥 ignore case
    });

    if (existingUser) {
      return res.json({ available: false });
    }

    res.json({ available: true });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};