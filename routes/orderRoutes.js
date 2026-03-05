const express = require("express");
const router = express.Router();
const { createOrder, verifyOrder } = require("../controllers/orderController");

router.post("/", createOrder);
router.get("/verify/:reference", verifyOrder);

module.exports = router;
