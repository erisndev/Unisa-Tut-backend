const Order = require("../models/Order");
const Faculty = require("../models/Faculty");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Package = require("../models/Package");
const { generateReference } = require("../utils/generateReference");
const sendEmail = require("../services/sendEmail");
const orderEmailTemplate = require("../services/orderEmailTemplate");
const mongoose = require("mongoose");

const isValidObjectId = (id) => {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id
  );
};

exports.createOrder = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      facultyId,
      courseId,
      moduleIds,
      faculty,
      course,
      modules,
      packageId,
      package: packageFromBody,
    } = req.body;

    const resolvedFacultyId = facultyId || faculty;
    const resolvedCourseId = courseId || course;
    const resolvedModuleIds = moduleIds || modules;
    const resolvedPackageId = packageId || packageFromBody;

    if (
      !fullName ||
      !email ||
      !phone ||
      !resolvedFacultyId ||
      !resolvedCourseId ||
      !Array.isArray(resolvedModuleIds) ||
      !resolvedPackageId
    ) {
      return res.status(400).json({
        message:
          "fullName, email, phone, facultyId (or faculty), courseId (or course), moduleIds (or modules[]), packageId (or package) are required",
      });
    }

    if (!isValidObjectId(resolvedFacultyId) || !isValidObjectId(resolvedCourseId) || !isValidObjectId(resolvedPackageId)) {
      return res.status(400).json({ message: "Invalid id format" });
    }

    const facultyDoc = await Faculty.findById(resolvedFacultyId);
    if (!facultyDoc) return res.status(400).json({ message: "Invalid faculty" });

    const courseDoc = await Course.findOne({ _id: resolvedCourseId, faculty: resolvedFacultyId });
    if (!courseDoc) return res.status(400).json({ message: "Invalid course" });

    const modulesSelected = await Module.find({
      _id: { $in: resolvedModuleIds },
      course: resolvedCourseId,
      isActive: true,
    });

    if (!modulesSelected.length) {
      return res.status(400).json({ message: "No valid modules selected" });
    }

    const pkg = await Package.findOne({ _id: resolvedPackageId, isActive: true });
    if (!pkg) return res.status(400).json({ message: "Invalid package" });

    const totalAmount = pkg.pricePerModule * modulesSelected.length;

    const order = await Order.create({
      fullName,
      email,
      phone,
      faculty: resolvedFacultyId,
      course: resolvedCourseId,
      modules: modulesSelected.map((m) => m._id),
      package: pkg._id,
      totalAmount,
      paymentReference: generateReference(),
      status: "pending",
    });

    // Email confirmation (best-effort)
    try {
      const payNowUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/pay?orderId=${order._id.toString()}&reference=${order.paymentReference}`;

      await sendEmail({
        to: email,
        subject: "Unisa Tut - Order Created (Payment Pending)",
        html: orderEmailTemplate({
          fullName,
          orderId: order._id.toString(),
          paymentReference: order.paymentReference,
          totalAmount,
          packageName: pkg.name,
          packageCode: pkg.code,
          modulesCount: modulesSelected.length,
          paymentStatus: order.status,
          payNowUrl,
          frontendUrl: process.env.FRONTEND_URL,
        }),
      });
    } catch (e) {
      console.error("Failed to send order email:", e.message);
    }

    res.json({
      orderId: order._id.toString(),
      totalAmount,
      paymentReference: order.paymentReference,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message });
  }
};

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
      packageId,
    } = req.body;

    if (!fullName || !email || !phone || !Array.isArray(modules) || !modules.length) {
      return res.status(400).json({ message: "fullName, email, phone and modules[] are required" });
    }

    if (!packageId || !isValidObjectId(packageId)) {
      return res.status(400).json({ message: "packageId is required" });
    }

    let faculty;
    if (facultyId && isValidObjectId(facultyId)) {
      faculty = await Faculty.findById(facultyId);
    }

    if (!faculty && facultyName) {
      faculty = await Faculty.create({ name: facultyName, description: "Created from booking" });
    }

    if (!faculty) return res.status(400).json({ message: "Faculty is required" });

    let course;
    if (courseId && isValidObjectId(courseId)) {
      course = await Course.findOne({ _id: courseId, faculty: faculty._id });
    }

    if (!course && courseName) {
      course = await Course.create({
        faculty: faculty._id,
        title: courseName,
        description: "Created from booking",
        isActive: true,
      });
    }

    if (!course) return res.status(400).json({ message: "Course is required" });

    const moduleIds = [];
    for (const mod of modules) {
      let modDoc;
      if (mod.id && isValidObjectId(mod.id)) {
        modDoc = await Module.findById(mod.id);
      }
      if (!modDoc) {
        modDoc = await Module.create({
          course: course._id,
          title: mod.name || mod.code || "Module",
          description: mod.code || "",
          price: Number(mod.price || 0),
          isActive: true,
        });
      }
      moduleIds.push(modDoc._id);
    }

    const pkg = await Package.findOne({ _id: packageId, isActive: true });
    if (!pkg) return res.status(400).json({ message: "Invalid package" });

    const calculatedTotal = pkg.pricePerModule * moduleIds.length;

    const paymentReference = generateReference();
    const order = await Order.create({
      fullName,
      email,
      phone,
      faculty: faculty._id,
      course: course._id,
      modules: moduleIds,
      package: pkg._id,
      totalAmount: calculatedTotal,
      paymentReference,
      status: "pending",
    });

    // Email confirmation (best-effort)
    try {
      const payNowUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/pay?orderId=${order._id.toString()}&reference=${paymentReference}`;

      await sendEmail({
        to: email,
        subject: "Unisa Tut - Order Created (Payment Pending)",
        html: orderEmailTemplate({
          fullName,
          orderId: order._id.toString(),
          paymentReference,
          totalAmount: calculatedTotal,
          packageName: pkg.name,
          packageCode: pkg.code,
          modulesCount: moduleIds.length,
          paymentStatus: order.status,
          payNowUrl,
          frontendUrl: process.env.FRONTEND_URL,
        }),
      });
    } catch (e) {
      console.error("Failed to send order email:", e.message);
    }

    res.json({
      orderId: order._id.toString(),
      totalAmount: calculatedTotal,
      paymentReference,
      success: true,
    });
  } catch (error) {
    console.error("Error creating order with details:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ paymentReference: req.params.reference }).populate(
      "faculty course modules package"
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("faculty course modules package")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "faculty course modules package"
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
