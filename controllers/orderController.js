const Order = require("../models/Order");
const Faculty = require("../models/Faculty");
const Course = require("../models/Course");
const Module = require("../models/Module");
const { generateReference } = require("../utils/generateReference");

exports.createOrder = async (req, res) => {
  const { fullName, email, phone, facultyId, courseId, moduleIds } = req.body;

  const faculty = await Faculty.findById(facultyId);
  if (!faculty) return res.status(400).json({ message: "Invalid faculty" });

  const course = await Course.findOne({ _id: courseId, faculty: facultyId });
  if (!course) return res.status(400).json({ message: "Invalid course" });

  const modulesSelected = await Module.find({
    _id: { $in: moduleIds },
    course: courseId,
    isActive: true
  });

  if (!modulesSelected.length) return res.status(400).json({ message: "No valid modules selected" });

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

  res.json({ orderId: order._id, totalAmount, paymentReference: order.paymentReference });
};

exports.verifyOrder = async (req, res) => {
  const order = await Order.findOne({ paymentReference: req.params.reference })
    .populate("faculty course modules");

  if (!order) return res.status(404).json({ message: "Order not found" });

  res.json(order);
};
