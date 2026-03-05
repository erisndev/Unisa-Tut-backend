const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  faculty: { type: ObjectId, ref: "Faculty" },
  title: String,
  description: String,
  isActive: { type: Boolean, default: true },
});
const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
