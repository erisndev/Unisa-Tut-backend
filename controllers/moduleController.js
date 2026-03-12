const Module = require("../models/Module");

// Get all modules
exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.find({ isActive: true }).populate("course");
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get module by ID
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate("course");
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    res.json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new module
exports.createModule = async (req, res) => {
  try {
    const module = new Module(req.body);
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a module
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    res.json(module);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a module
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findByIdAndDelete(req.params.id);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    res.json({ message: "Module deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
