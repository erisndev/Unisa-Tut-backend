const Course = require("../models/Course");
const Faculty = require("../models/Faculty");
const Module = require("../models/Module");

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("faculty");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("faculty");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { faculty, title, description, isActive } = req.body;

    // Validate faculty exists (Course schema requires it)
    const facultyDoc = await Faculty.findById(faculty);
    if (!facultyDoc) {
      return res.status(400).json({ message: "Invalid faculty" });
    }

    const course = await Course.create({
      faculty,
      title,
      description,
      isActive,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a course
exports.updateCourse = async (req, res) => {
  try {
    // If faculty is being changed, validate it
    if (req.body.faculty) {
      const facultyDoc = await Faculty.findById(req.body.faculty);
      if (!facultyDoc) {
        return res.status(400).json({ message: "Invalid faculty" });
      }
    }

    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get modules by course
exports.getModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.find({ course: req.params.id, isActive: true });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
