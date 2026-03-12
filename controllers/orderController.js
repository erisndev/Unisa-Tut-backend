const Order = require("../models/Order");
const Faculty = require("../models/Faculty");
const Course = require("../models/Course");
const Module = require("../models/Module");
const { generateReference } = require("../utils/generateReference");
const mongoose = require("mongoose");

// Helper function to check if string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
};

// Create order using MongoDB ObjectIds (when frontend has backend data)
exports.createOrder = async (req, res) => {
  try {
    const { fullName, email, phone, facultyId, courseId, moduleIds } = req.body;

    // Find faculty
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(400).json({ message: "Invalid faculty" });
    }

    // Find course
    const course = await Course.findOne({ _id: courseId, faculty: facultyId });
    if (!course) {
      return res.status(400).json({ message: "Invalid course" });
    }

    // Find modules
    const modulesSelected = await Module.find({
      _id: { $in: moduleIds },
      course: courseId,
      isActive: true
    });

    if (!modulesSelected.length) {
      return res.status(400).json({ message: "No valid modules selected" });
    }

    const totalAmount = modulesSelected.reduce((acc, m) => acc + m.price, 0);

    const order = await Order.create({
      fullName,
      email,
      phone,
      faculty: facultyId,
      course: courseId,
      modules: modulesSelected.map(m => m._id),
      totalAmount,
      paymentReference: generateReference(),
      status: "pending"
    });

    res.json({ 
      orderId: order._id.toString(), 
      totalAmount, 
      paymentReference: order.paymentReference 
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create order with embedded module data (when frontend uses local data)
exports.createOrderWithDetails = async (req, res) => {
  try {
    const { 
      fullName, 
      email, 
      phone, 
      facultyName, 
      facultyId,
      courseName, 
      courseId,
      modules,
      totalAmount,
      packageId 
    } = req.body;

    // Try to find or create faculty
    let faculty;
    if (facultyId && isValidObjectId(facultyId)) {
      faculty = await Faculty.findById(facultyId);
    }
    
    // If no faculty found, create a new one
    if (!faculty && facultyName) {
      faculty = await Faculty.create({
        name: facultyName,
        description: "Created from booking"
      });
    }

    if (!faculty) {
      return res.status(400).json({ message: "Faculty is required" });
    }

    // Try to find or create course
    let course;
    if (courseId && isValidObjectId(courseId)) {
      course = await Course.findOne({ _id: courseId, faculty: faculty._id });
    }

    if (!course && courseName) {
      course = await Course.create({
        faculty: faculty._id,
        title: courseName,
        description: "Created from booking",
        isActive: true
      });
    }

    if (!course) {
      return res.status(400).json({ message: "Course is required" });
    }

    // Create or find modules
    const moduleIds = [];
    const createdModules = [];

    for (const mod of modules) {
      let modDoc;
      
      // Only try to find if it's a valid MongoDB ObjectId
      if (mod.id && isValidObjectId(mod.id)) {
        modDoc = await Module.findById(mod.id);
      }

      // Create module if not found
      if (!modDoc) {
        modDoc = await Module.create({
          course: course._id,
          title: mod.name || mod.code,
          description: mod.code,
          price: mod.price || 0,
          isActive: true
        });
      }

      moduleIds.push(modDoc._id);
      createdModules.push(modDoc);
    }

    // Calculate total if not provided
    const calculatedTotal = totalAmount || createdModules.reduce((acc, m) => acc + m.price, 0);

    // Create order
    const paymentReference = generateReference();
    const order = await Order.create({
      fullName,
      email,
      phone,
      faculty: faculty._id,
      course: course._id,
      modules: moduleIds,
      totalAmount: calculatedTotal,
      paymentReference,
      status: "pending"
    });

    res.json({ 
      orderId: order._id.toString(), 
      totalAmount: calculatedTotal, 
      paymentReference,
      success: true
    });
  } catch (error) {
    console.error("Error creating order with details:", error);
    res.status(500).json({ message: error.message });
  }
};

// Verify order by payment reference
exports.verifyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ paymentReference: req.params.reference })
      .populate("faculty course modules");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("faculty course modules")
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("faculty course modules");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
