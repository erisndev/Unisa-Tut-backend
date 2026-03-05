const express = require("express");
const router = express.Router();
const { getFaculties, getCoursesByFaculty } = require("../controllers/facultyController");

router.get("/", getFaculties);
router.get("/:id/courses", getCoursesByFaculty);

module.exports = router;
