const Faculty = require("../models/Faculty");
const Course = require("../models/Course");

exports.getFaculties = async (req, res) => {
  const faculties = await Faculty.find();
  res.json(faculties);
};

exports.getCoursesByFaculty = async (req, res) => {
  const courses = await Course.find({ faculty: req.params.id, isActive: true });
  res.json(courses);
};
