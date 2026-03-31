const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const { getAllOrders, getOrderById } = require("../controllers/orderController");

router.use(adminAuth);

// View all orders
router.get("/", getAllOrders);

// View order by id
router.get("/:id", getOrderById);

module.exports = router;
