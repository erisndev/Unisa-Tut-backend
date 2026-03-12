const express = require("express");
const router = express.Router();
const { 
  initializePayment, 
  verifyPayment, 
  paymentWebhook,
  getPaymentStatus 
} = require("../controllers/paymentController");

// Initialize payment
router.post("/initialize", initializePayment);

// Verify payment
router.get("/verify/:reference", verifyPayment);

// Get payment status for order
router.get("/status/:orderId", getPaymentStatus);

// Paystack webhook
router.post("/webhook", paymentWebhook);

module.exports = router;
