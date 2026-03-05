const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking: { type: ObjectId, ref: "Booking" },
  transactionId: String,
  amount: Number,
  status: String,
  provider: String,
});
const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
