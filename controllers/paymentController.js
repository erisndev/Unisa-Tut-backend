const axios = require("axios");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

// Initialize Paystack payment
exports.initializePayment = async (req, res) => {
  try {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
      return res
        .status(400)
        .json({ message: "orderId and email are required" });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "PAYSTACK_SECRET_KEY not configured." });
    }

    if (!process.env.FRONTEND_URL) {
      return res.status(500).json({ message: "FRONTEND_URL not configured" });
    }

    // Find the order and compute amount server-side (do not trust client)
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "paid") {
      return res.status(400).json({ message: "Order already paid" });
    }

    const amount = Number(order.totalAmount || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference: order.paymentReference,
        callback_url: `${process.env.FRONTEND_URL}/payment-success?order=${orderId}`,
        metadata: {
          orderId: order._id.toString(),
          paymentReference: order.paymentReference,
        },
      },
      { headers },
    );

    // Create/Upsert a pending payment record
    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        order: order._id,
        transactionId: order.paymentReference,
        amount,
        status: "pending",
        provider: "Paystack",
      },
      { upsert: true, new: true },
    );

    res.json({
      paymentUrl: response.data.data.authorization_url,
      reference: order.paymentReference,
      accessCode: response.data.data.access_code,
      amount,
    });
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      message: "Failed to initialize payment",
      error: error.response?.data || error.message,
    });
  }
};

// Verify payment with Paystack
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "PAYSTACK_SECRET_KEY not configured" });
    }

    const headers = {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    };

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers },
    );

    const data = response.data.data;
    const { status, amount, gateway_response, customer } = data;

    // Find order
    const order = await Order.findOne({ paymentReference: reference });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const paidAmount = (amount || 0) / 100;
    const expectedAmount = Number(order.totalAmount || 0);

    if (status === "success") {
      // Validate amount matches order
      if (Math.round(paidAmount) !== Math.round(expectedAmount)) {
        order.status = "failed";
        await order.save();

        await Payment.findOneAndUpdate(
          { order: order._id },
          {
            order: order._id,
            transactionId: reference,
            amount: paidAmount,
            status: "amount_mismatch",
            provider: "Paystack",
          },
          { upsert: true, new: true },
        );

        return res.status(400).json({
          success: false,
          message: "Payment amount mismatch",
          expectedAmount,
          paidAmount,
        });
      }

      if (order.status !== "paid") {
        order.status = "paid";
        await order.save();
      }

      await Payment.findOneAndUpdate(
        { order: order._id },
        {
          order: order._id,
          transactionId: reference,
          amount: paidAmount,
          status: "success",
          provider: "Paystack",
        },
        { upsert: true, new: true },
      );

      return res.json({
        success: true,
        message: "Payment verified successfully",
        order,
        payment: {
          status,
          amount: paidAmount,
          gateway_response,
          customer,
        },
      });
    }

    // Not successful
    order.status = "failed";
    await order.save();

    await Payment.findOneAndUpdate(
      { order: order._id },
      {
        order: order._id,
        transactionId: reference,
        amount: paidAmount,
        status: status || "failed",
        provider: "Paystack",
      },
      { upsert: true, new: true },
    );

    res.json({
      success: false,
      message: "Payment verification failed",
      data,
    });
  } catch (error) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.response?.data || error.message,
    });
  }
};

// Paystack webhook handler
exports.paymentWebhook = async (req, res) => {
  try {
    // Verify event signature (required for production)
    const signature = req.headers["x-paystack-signature"];
    if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
      return res.sendStatus(401);
    }

    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.sendStatus(401);
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const orderRef = event.data.reference;
      const order = await Order.findOne({ paymentReference: orderRef });

      if (order) {
        const paidAmount = (event.data.amount || 0) / 100;
        const expectedAmount = Number(order.totalAmount || 0);

        if (Math.round(paidAmount) !== Math.round(expectedAmount)) {
          order.status = "failed";
          await order.save();

          await Payment.findOneAndUpdate(
            { order: order._id },
            {
              order: order._id,
              transactionId: String(event.data.id || orderRef),
              amount: paidAmount,
              status: "amount_mismatch",
              provider: "Paystack",
            },
            { upsert: true, new: true },
          );

          return res.sendStatus(200);
        }

        if (order.status !== "paid") {
          order.status = "paid";
          await order.save();
        }

        await Payment.findOneAndUpdate(
          { order: order._id },
          {
            order: order._id,
            transactionId: String(event.data.id || orderRef),
            amount: paidAmount,
            status: "success",
            provider: "Paystack",
          },
          { upsert: true, new: true },
        );

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

    const order = await Order.findById(orderId).populate(
      "faculty course modules package",
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.findOne({ order: orderId });

    res.json({
      order,
      payment,
      paymentStatus: order.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
