const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const {
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require("../controllers/facultyController");

router.use(adminAuth);

router.get("/", getFaculties);
router.get("/:id", getFacultyById);
router.post("/", createFaculty);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);

module.exports = router;
