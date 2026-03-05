const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  title: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Course", courseSchema);
