const Visitor = require("../models/Visitor");

exports.trackVisitor = async (req, res) => {
  try {

    const today = new Date();
    today.setHours(0,0,0,0);

    const existingVisitor = await Visitor.findOne({
      ip: req.ip,
      date: { $gte: today }
    });

    if(!existingVisitor){

      const visitor = new Visitor({
        ip: req.ip
      });

      await visitor.save();

    }

    res.json({ message: "visitor tracked" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};