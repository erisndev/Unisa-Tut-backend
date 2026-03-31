const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const {
  adminGetAllPackages,
  adminCreatePackage,
  adminUpdatePackage,
  adminDeletePackage,
} = require("../controllers/packageController");

router.use(adminAuth);

router.get("/", adminGetAllPackages);
router.post("/", adminCreatePackage);
router.put("/:id", adminUpdatePackage);
router.delete("/:id", adminDeletePackage);

module.exports = router;
