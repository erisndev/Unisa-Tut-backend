const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true }],
  totalAmount: Number,
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  paymentReference: String
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
