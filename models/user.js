
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
      unique: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },



verificationCode: {
  type: String,
  default: null
},
verificationExpires: {
  type: Date,
  default: null
},
isVerified: {
  type: Boolean,
  default: false
},




    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "expert", "patient"],
      default: "patient",
    },

    
    status: {
  type: String,
  enum: ["not_verified", "pending", "approved"],
  default: "not_verified",
},

    plan: {
      type: String,
      enum: ["Free", "Plus", "Pro"],
      default: "Free",
    },

planEndDate: Date,
    
paymentRequired: {
  type: Boolean,
  default: true
},



    pendingEmail: {
  type: String,
},



////////////////////////////
goalType: {
  type: String,
  enum: ["cutting", "maintenance", "bulking"],
  default: "maintenance"
},

goalCalories: {
  type: Number,
  default: 0
},

macros: {
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 }
},
dailyBudget: {
  type: Number,
  default: 0
},
////////////////////


    expert: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null
},

isAccepted: {
  type: Boolean,
  default: false
},
    
   patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

   history: [
{
  action: String,
  date: {
    type: Date,
    default: Date.now
  }
}
],
expertAssignedAt: Date,

weightHistory: [
{
  weight: {
    type:Number,
    default:0
  },
  date: {
    type: Date,
    default: Date.now
  }
}
],

diet: {
  breakfast: [
    {
      recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
    }
  ],
  lunch: [
    {
      recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
    }
  ],
  dinner: [
    {
      recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
    }
  ],
  snacks: [
    {
      recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
    }
  ]
},



/*dietHistory: [
{
  recipes: [
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe"
    },
    servings: {
      type: Number,
      default: 1
    }
  }
],
  totalCalories: Number,
  totalPrice: Number,
  date:{
    type: Date,
    default: Date.now
  }
}
],*/

requestedPlan: {
  type: String,
  enum: ["Free", "Plus", "Pro"],
  default: null
},




dietHistory: [
{
  recipes: [
  {
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe"
    },
    servings: {
      type: Number,
      default: 1
    },
    price: {              // 👈 أضف هذا
      type: Number,
      default: 0
    }
  }
],
  totalCalories: Number,
  totalPrice: Number,
  date:{
    type: Date,
    default: Date.now
  }
}
],

   //      expert: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   photo: {
  type: String,
  //default: "https://i.pravatar.cc/150"
  default: "/uploads/default-avatar.png"
},
    ////////////////////////////////////////
    // 🟣 NEW FIELDS FOR PRO FEATURES
    ////////////////////////////////////////

    phone: {
  type: String,
  default: ""
},
    gender: {
      type: String,
      enum: ["male", "female"],
    },

    age: {
  type: Number,
  min: 1,
  max: 120,
  default: null
},


   height: {
  type: Number,
  default: 0
},


    weight: {
  type: Number,
  default: 0
},


   activityLevel: {
  type: String,
  enum: ["Sedentary", "Light", "Moderate", "Active", "VeryActive"],
  default: "Sedentary"
},


    chronicDisease: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }

);

////////////////////////////////////////////////////
// 🔐 HASH PASSWORD BEFORE SAVE
////////////////////////////////////////////////////
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

////////////////////////////////////////////////////
// 🔐 COMPARE PASSWORD
////////////////////////////////////////////////////
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

////////////////////////////////////////////////////
// 🚀 REMOVE PASSWORD FROM JSON RESPONSE
////////////////////////////////////////////////////
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};


userSchema.virtual("bmi").get(function(){

if(!this.weight || !this.height) return null;

const h = this.height / 100;

return Number((this.weight/(h*h)).toFixed(2));

});

//module.exports = mongoose.model("User", userSchema);
module.exports = mongoose.models.User || mongoose.model("User", userSchema);