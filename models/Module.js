const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("Module", moduleSchema);
