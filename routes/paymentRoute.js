const express = require("express");
const router = express.Router();
const { initializePayment, paymentWebhook } = require("../controllers/paymentController");

router.post("/initialize", initializePayment);
router.post("/webhook", paymentWebhook);

module.exports = router;
