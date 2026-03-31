const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Unisa Tut API is running");
});

// MongoDB connection
const connectDB = require("./config/db");
connectDB();

// Routes
app.use("/api/faculties", require("./routes/facultyRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/modules", require("./routes/moduleRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/payments", require("./routes/paymentRoute"));
app.use("/api/packages", require("./routes/packageRoutes"));

// Admin routes (JWT protected)
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/faculties", require("./routes/adminFacultyRoutes"));
app.use("/api/admin/courses", require("./routes/adminCourseRoutes"));
app.use("/api/admin/modules", require("./routes/adminModuleRoutes"));
app.use("/api/admin/orders", require("./routes/adminOrderRoutes"));
app.use("/api/admin/packages", require("./routes/adminPackageRoutes"));

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
