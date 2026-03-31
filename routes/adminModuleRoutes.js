const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const {
  getAllModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
} = require("../controllers/moduleController");

router.use(adminAuth);

router.get("/", getAllModules);
router.get("/:id", getModuleById);
router.post("/", createModule);
router.put("/:id", updateModule);
router.delete("/:id", deleteModule);

module.exports = router;
