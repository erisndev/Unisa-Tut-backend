const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String
});

module.exports = mongoose.model("Faculty", facultySchema);
