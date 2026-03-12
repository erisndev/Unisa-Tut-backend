const express = require("express");
const router = express.Router();
const {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule
} = require("../controllers/moduleController");

// Get all modules
router.get("/", getAllModules);

// Get module by ID
router.get("/:id", getModuleById);

// Create a new module
router.post("/", createModule);

// Update a module
router.put("/:id", updateModule);

// Delete a module
router.delete("/:id", deleteModule);

module.exports = router;
