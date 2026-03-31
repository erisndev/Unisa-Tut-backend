const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    transactionId: String,
    amount: Number,
    status: String,
    provider: { type: String, default: "Paystack" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
