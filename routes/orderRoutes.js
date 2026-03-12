const express = require("express");
const router = express.Router();
const { 
  createOrder, 
  createOrderWithDetails,
  verifyOrder,
  getAllOrders,
  getOrderById
} = require("../controllers/orderController");

// Create order using MongoDB ObjectIds
router.post("/", createOrder);

// Create order with full details (for frontend with local data)
router.post("/create-with-details", createOrderWithDetails);

// Verify order by payment reference
router.get("/verify/:reference", verifyOrder);

// Get all orders (admin)
router.get("/", getAllOrders);

// Get order by ID
router.get("/:id", getOrderById);

module.exports = router;
