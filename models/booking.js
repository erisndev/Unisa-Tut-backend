const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,

  faculty: { type: ObjectId, ref: "Faculty" },
  course: { type: ObjectId, ref: "Course" },
  modules: [{ type: ObjectId, ref: "Module" }],

  totalAmount: Number,

  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },

  paymentReference: String,
});
const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
