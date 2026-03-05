const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  course: { type: ObjectId, ref: "Course" },
  title: String,
  description: String,
  price: Number,
  isActive: { type: Boolean, default: true },
});
const Module = mongoose.model("Module", moduleSchema);
module.exports = Module;
