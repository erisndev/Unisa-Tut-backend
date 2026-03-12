const axios = require("axios");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

// Initialize Paystack payment
exports.initializePayment = async (req, res) => {
  try {
    const { orderId, email, amount } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Convert to kobo
        reference: order.paymentReference,
        callback_url: `${process.env.FRONTEND_URL}/payment-success?order=${orderId}`,
        metadata: {
          orderId: order._id.toString(),
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: order._id
            }
          ]
        }
      },
      { headers }
    );

    res.json({
      paymentUrl: response.data.data.authorization_url,
      reference: order.paymentReference,
      accessCode: response.data.data.access_code
    });
  } catch (error) {
    console.error("Paystack initialization error:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Failed to initialize payment",
      error: error.response?.data || error.message 
    });
  }
};

// Verify payment with Paystack
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
    };

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers }
    );

    const { status, amount, gateway_response, customer } = response.data.data;

    if (status === "success") {
      // Update order status
      const order = await Order.findOne({ paymentReference: reference });
      if (order) {
        order.status = "paid";
        await order.save();

        // Create payment record
        await Payment.create({
          order: order._id,
          transactionId: reference,
          amount: amount / 100,
          status: "success",
          provider: "Paystack"
        });

        return res.json({
          success: true,
          message: "Payment verified successfully",
          order,
          payment: {
            status,
            amount: amount / 100,
            gateway_response,
            customer
          }
        });
      }
    }

    res.json({
      success: false,
      message: "Payment verification failed",
      data: response.data.data
    });
  } catch (error) {
    console.error("Paystack verification error:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Failed to verify payment",
      error: error.response?.data || error.message 
    });
  }
};

// Paystack webhook handler
exports.paymentWebhook = async (req, res) => {
  try {
    const event = req.body;

    // Verify event signature in production
    // const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
    // if (hash !== req.headers['x-paystack-signature']) {
    //   return res.sendStatus(401);
    // }

    if (event.event === "charge.success") {
      const orderRef = event.data.reference;
      const order = await Order.findOne({ paymentReference: orderRef });

      if (order && order.status !== "paid") {
        order.status = "paid";
        await order.save();

        await Payment.create({
          order: order._id,
          transactionId: event.data.id,
          amount: event.data.amount / 100,
          status: "success",
          provider: "Paystack"
        });

        console.log(`Order ${order._id} marked as paid via webhook`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
};

// Get payment status for an order
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("faculty course modules");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.findOne({ order: orderId });

    res.json({
      order,
      payment,
      paymentStatus: order.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
