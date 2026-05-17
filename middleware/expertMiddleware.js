module.exports = (req, res, next) => {
  if (req.user.role !== "expert") {
    return res.status(403).json({
      message: "Access denied. Expert only."
    });
  }

  next();
};