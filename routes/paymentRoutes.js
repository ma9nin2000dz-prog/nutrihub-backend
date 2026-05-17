const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const User = require("../models/user");

const Payment = require("../models/Payment");
// 📁 upload config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// 📤 route
router.post("/payment-proof", upload.single("file"), async (req, res) => {
  try {
   // const { rip, ccp } = req.body;
   const { rip, ccp, email } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 📧 transporter
    /*const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });*/


    const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525,
  secure: false,
  auth: {
    user: process.env.SMTP_USER, // ab92df001@smtp-brevo.com من Render
    pass: process.env.SMTP_PASS, // API Key من Render
  },
  tls: { rejectUnauthorized: false }
});

    // 📤 send mail
    /*await transporter.sendMail({
      to: process.env.EMAIL_USER,
      subject: "New Payment Proof",
      text: `RIP: ${rip}\nCCP: ${ccp}`,
      attachments: [
        {
          filename: file.originalname,
          path: file.path,
        }
      ]
    });


 // 🔥 GET USER
const user = await User.findOne({ email });*/





const user = await User.findOne({ email });

if (!user) {
  return res.status(404).json({ message: "User not found" });
}

/*await transporter.sendMail({
  to: process.env.EMAIL_USER,

  subject: `Payment Proof - ${user.name} - ${user.email} - ${user.plan}`,

  text: `
User Name: ${user.name}
User Email: ${user.email}
Plan: ${user.plan}
RIP: ${rip}
CCP: ${ccp}

Payment proof attached.
`,

  attachments: [
    {
      filename: `payment-${user.email}.pdf`,
      path: file.path
    }
  ]
});*/

await transporter.sendMail({
  // 1. استخدم الإيميل المفعّل في Brevo كمرسل
  from: '"NutriHub Admin" <makninoh@gmail.com>', 
  
  // 2. أرسل الإثبات لنفسك (للإدارة) لتتمكن من مراجعته
  to: "makninoh@gmail.com", 

  subject: `Payment Proof - ${user.name} - ${user.plan}`,

  text: `
    User Name: ${user.name}
    User Email: ${user.email}
    Plan: ${user.plan}
    RIP: ${rip}
    CCP: ${ccp}
    Payment proof attached.
  `,

  attachments: [
    {
      filename: `payment-${user.email}.pdf`,
      path: file.path
    }
  ]
});





if (!user) {
  return res.status(404).json({ message: "User not found" });
}

// 🔥 CHECK EXISTING PAYMENT
/*const existing = await Payment.findOne({
  email,
  status: "pending"
});*/
const existing = await Payment.findOne({
  email,
  plan: user.plan,
  status: "pending"
});

// 🔥 CREATE ONLY IF NOT EXISTS
if (!existing) {
  await Payment.create({
    email,
    plan: user.plan,
    amount: 0,
    status: "pending"
  });
}
// 🔥 user بعث proof → ما نرجعوش نظهرولو modal
/*await User.findOneAndUpdate(
  { email },
  { paymentRequired: false }
);*/

await User.findOneAndUpdate(
  { email },
  {
    paymentRequired: false,
    status: "pending" // 🔥 هذا المهم
  }
);


fs.unlink(file.path, (err) => {
  if (err) console.log("DELETE ERROR:", err);
  else console.log("FILE DELETED ✔");
});


    res.json({ message: "Payment sent successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;