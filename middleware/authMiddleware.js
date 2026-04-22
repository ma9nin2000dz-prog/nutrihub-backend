const jwt = require("jsonwebtoken");
const User = require("../models/user");

/////////////////////////////////////////////////////
// 🔐 PROTECT ROUTE
/////////////////////////////////////////////////////
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized, no token provided",
      });
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token invalid",
    });
  }
};

/////////////////////////////////////////////////////
// 🔐 ADMIN ONLY
/////////////////////////////////////////////////////
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Admin only.",
  });
};

/////////////////////////////////////////////////////
// 🔐 EXPERT ONLY (Future Use)
/////////////////////////////////////////////////////
const expertOnly = (req, res, next) => {
  if (req.user && req.user.role === "expert") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Expert only.",
  });
};

/////////////////////////////////////////////////////
// 🔐 ADMIN OR EXPERT
/////////////////////////////////////////////////////
const adminOrExpert = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "expert")
  ) {
    return next();
  }

  return res.status(403).json({
    message: "Access denied.",
  });
};

module.exports = {
  protect,
  adminOnly,
  expertOnly,
  adminOrExpert,
};
