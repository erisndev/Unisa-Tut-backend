const axios = require("axios");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

exports.initializePayment = async (req, res) => {
  const { orderId, email, amount } = req.body;

  const headers = {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json"
  };

  const response = await axios.post("https://api.paystack.co/transaction/initialize", {
    email,
    amount: amount * 100, // in kobo
    callback_url: `${process.env.FRONTEND_URL}/payment-success?order=${orderId}`
  }, { headers });

  res.json({ paymentUrl: response.data.data.authorization_url });
};

exports.paymentWebhook = async (req, res) => {
  const event = req.body;

  // Verify event signature here (optional for dev)
  if (event.event === "charge.success") {
    const orderRef = event.data.reference;
    const order = await Order.findOne({ paymentReference: orderRef });

    if (order) {
      order.status = "paid";
      await order.save();

      await Payment.create({
        order: order._id,
        transactionId: event.data.id,
        amount: event.data.amount / 100,
        status: "success",
        provider: "Paystack"
      });
    }
  }

  res.sendStatus(200);
};
