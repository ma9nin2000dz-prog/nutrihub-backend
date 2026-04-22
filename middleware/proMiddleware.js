

const User = require("../models/user");

const proOnly = async (req, res, next) => {
  try {

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.plan !== "Pro") {
      return res.status(403).json({
        message: "Access denied. Pro account required.",
      });
    }

    next();

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = proOnly;