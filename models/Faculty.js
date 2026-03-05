const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  facultyName: {
    type: String,
    required: true,
  },
});
const Faculty = mongoose.model("Faculty", facultySchema);
module.exports = Faculty;
