const Faculty = require("../models/Faculty");
const Course = require("../models/Course");

// Get all faculties
exports.getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get faculty by ID
exports.getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new faculty
exports.createFaculty = async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a faculty
exports.updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json(faculty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a faculty
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get courses by faculty
exports.getCoursesByFaculty = async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.params.id, isActive: true });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
