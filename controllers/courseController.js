const Module = require("../models/Module");

exports.getModulesByCourse = async (req, res) => {
  const modules = await Module.find({ course: req.params.id, isActive: true });
  res.json(modules);
};
