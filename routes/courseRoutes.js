const express = require("express");
const router = express.Router();
const { getModulesByCourse } = require("../controllers/courseController");

router.get("/:id/modules", getModulesByCourse);

module.exports = router;
