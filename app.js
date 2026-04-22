

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const planRoutes = require("./routes/planRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const statsRoutes = require("./routes/statsRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");

const paymentRoutes = require("./routes/paymentRoutes");
//const recommendationRoutes = require("./routes/recommendations");/////////////////////////

const settingsRoutes = require("./routes/settingsRoutes");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes"); // ✅ مهم
const recipeRoutes = require("./routes/recipeRoutes");
const proRoutes = require("./routes/proRoutes");//////prooooooooooo
const app = express();

const recommendationRoutes = require("./routes/recommendationRoutes");
const expertRoutes = require("./routes/expertRoutes");


app.use(cors());
//app.use(express.json());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));



app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");/////////////////////
  next();
});
///////////////////////////////
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
///////////////////////////////
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api", authRoutes);

app.use("/api", settingsRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes); // ✅ هنا
app.use("/api/recipes", recipeRoutes);
app.use("/api/pro", proRoutes);///////prooooo

app.use("/api/plans", planRoutes);

app.use("/api", paymentRoutes);
app.use("/api/stats", statsRoutes);

app.use("/api/recommendations", recommendationRoutes);

app.use("/api/experts", expertRoutes);

app.use("/api/visitor", visitorRoutes);///////////////////
app.use("/api/admin/dashboard", adminDashboardRoutes);//////////////
app.use("/api/recommendations", recommendationRoutes);

app.use("/uploads", express.static("uploads"));

app.listen(5000,"0.0.0.0", () => {
  console.log("Server running on port 5000");
});
  