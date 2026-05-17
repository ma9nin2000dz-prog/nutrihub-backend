const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/authMiddleware");

const User = require("../models/user");
const Product = require("../models/Product");
const Recipe = require("../models/Recipe");
const Visitor = require("../models/Visitor");
const Activity = require("../models/Activity");

// ========================================
// ADMIN DASHBOARD DATA
// ========================================
router.get("/", protect, adminOnly, async (req, res) => {

  try {

    // 🔹 COUNTS
    const products = await Product.countDocuments();
    const recipes = await Recipe.countDocuments();
    const users = await User.countDocuments();
    const experts = await User.countDocuments({ role: "expert" });
    const patients = await User.countDocuments({ role: "patient" });



// 🔹 DATE RANGE

const now = new Date();

/*const lastWeek = new Date(now);
lastWeek.setDate(now.getDate() - 7);*/
const lastWeek = new Date();
lastWeek.setHours(0,0,0,0);
lastWeek.setDate(lastWeek.getDate() - 6);

const twoWeeksAgo = new Date(now);
twoWeeksAgo.setDate(now.getDate() - 14);


// 🔹 EXPERTS THIS WEEK

const expertsThisWeek = await User.countDocuments({
 role: "expert",
 createdAt: { $gte: lastWeek }
});


// 🔹 EXPERTS LAST WEEK

const expertsLastWeek = await User.countDocuments({
 role: "expert",
 createdAt: {
  $gte: twoWeeksAgo,
  $lt: lastWeek
 }
});


// 🔹 PATIENTS THIS WEEK

const patientsThisWeek = await User.countDocuments({
 role: "patient",
 createdAt: { $gte: lastWeek }
});


// 🔹 PATIENTS LAST WEEK

const patientsLastWeek = await User.countDocuments({
 role: "patient",
 createdAt: {
  $gte: twoWeeksAgo,
  $lt: lastWeek
 }
});


// 🔹 GROWTH

const expertsGrowth =
 ((expertsThisWeek - expertsLastWeek) / (expertsLastWeek || 1)) * 100;

const patientsGrowth =
 ((patientsThisWeek - patientsLastWeek) / (patientsLastWeek || 1)) * 100;




    const visitors = await Visitor.countDocuments();

    // 🔹 PLAN DISTRIBUTION
    const free = await User.countDocuments({ plan: "Free" });
    const plus = await User.countDocuments({ plan: "Plus" });
    const pro = await User.countDocuments({ plan: "Pro" });

    // 🔹 LATEST USERS
    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name role plan createdAt");


// 🔹 PLAN CHANGE REQUESTS
const planRequests = await User.find({
  requestedPlan: { $ne: null }
}).select("name email photo requestedPlan plan role");


          
    // 🔹 PENDING APPROVALS
    const pendingUsers = await User.find({ status: "pending" })
      .select("name role plan");

    // 🔹 ACTIVITIES
    const activities = await Activity.find()
      .sort({ date: -1 })
      .limit(5)
      .populate("user", "name");
     

      //
      // 🔹 WEEKLY VISITORS
const visitorsData = await Visitor.aggregate([
 {
  $match:{
   date:{ $gte:lastWeek }
  }
 },
 {
  $group:{
   _id:{ $dayOfWeek:"$date" },
   visitors:{ $sum:1 }
  }
 }
]);



// 🔹 WEEKLY EXPERTS
const expertsData = await User.aggregate([
 {
  $match:{
   role:"expert",
   createdAt:{ $gte:lastWeek }
  }
 },
 {
  $group:{
   _id:{ $dayOfWeek:"$createdAt" },
   count:{ $sum:1 }
  }
 }
]);

// 🔹 WEEKLY PATIENTS
const patientsData = await User.aggregate([
 {
  $match:{
   role:"patient",
   createdAt:{ $gte:lastWeek }
  }
 },
 {
  $group:{
   _id:{ $dayOfWeek:"$createdAt" },
   count:{ $sum:1 }
  }
 }
]);

// 🔹 WEEKLY USERS
/*const usersData = await User.aggregate([
 {
  $match:{
   createdAt:{ $gte:lastWeek }
  }
 },
 {
  $group:{
   _id:{ $dayOfWeek:"$createdAt" },
   users:{ $sum:1 }
  }
 }
]);*/


// 🔹 WEEKLY USERS
/*const usersData = await User.aggregate([
 {
  $match:{
   createdAt:{ $gte:lastWeek }
  }
 },
 {
  $group:{
   _id:{ $dayOfWeek:"$createdAt" },
   users:{ $sum:1 }
  }
 }
]);*/



/*const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const weeklyVisitors = days.map((day,index)=>{
 const found = visitorsData.find(v => v._id === index+1);
 return {
  day,
  visitors: found ? found.visitors : 0
 };
});

const weeklyUsers = days.map((day,index)=>{
 const found = usersData.find(v => v._id === index+1);
 return {
  day,
  users: found ? found.users : 0
 };
});*/
const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// 🔹 WEEKLY VISITORS
const weeklyVisitors = days.map((day,index)=>{
 const found = visitorsData.find(v => v._id === index+1);
 return {
  day,
  visitors: found ? found.visitors : 0
 };
});

// 🔹 WEEKLY EXPERTS
const weeklyUsersExperts = days.map((day,index)=>{
 const found = expertsData.find(v => v._id === index+1);
 return {
  day,
  users: found ? found.count : 0
 };
});

// 🔹 WEEKLY PATIENTS
const weeklyUsersPatients = days.map((day,index)=>{
 const found = patientsData.find(v => v._id === index+1);
 return {
  day,
  users: found ? found.count : 0
 };
});



const admin = await User.findById(req.user.id)
  .select("name photo");
    res.json({

      counts: {
        products,
        recipes,
        users,
        experts,
        patients,
        visitors
      },

      plans: {
        free,
        plus,
        pro
      },

      growth:{
 experts: Math.round(expertsGrowth),
 patients: Math.round(patientsGrowth)
},

      latestUsers,
     pendingApprovals: pendingUsers,
      activities,
      
      //weeklyUsers,
      admin ,
      weeklyVisitors,
    weeklyUsersExperts,
    weeklyUsersPatients,
      planRequests
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

});

module.exports = router;