const ExtraCharge = require("../models/ExtraCharge");
const MessOff = require("../models/MessOff");
const User = require("../models/User");
const { getExtraItemByCode, EXTRA_ITEMS } = require("../utils/messCatalog");
const { buildStudentBill, resolveStudent } = require("../utils/billing");

function getIndiaTimestamp() {
  const now = new Date();
  return {
    date: now.toISOString().slice(0, 10),
    time: now.toLocaleTimeString("en-IN", {
      hour12: false,
      timeZone: "Asia/Kolkata",
    }),
  };
}

async function getExtrasCatalog(_req, res) {
  return res.json({
    items: EXTRA_ITEMS,
  });
}

async function addExtraCharge(req, res) {
  try {
    const { qrData, userId, itemCode, quantity = 1 } = req.body;
    let resolvedUserId = userId;

    if (!resolvedUserId && qrData) {
      const parsedQr = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
      resolvedUserId = parsedQr.userId;
    }

    if (!resolvedUserId || !itemCode) {
      return res.status(400).json({ message: "userId or qrData and itemCode are required" });
    }

    const student = await User.findById(resolvedUserId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const catalogItem = getExtraItemByCode(itemCode);
    if (!catalogItem) {
      return res.status(404).json({ message: "Extra item not found" });
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const { date, time } = getIndiaTimestamp();

    const extraCharge = await ExtraCharge.create({
      userId: student._id,
      date,
      time,
      itemCode: catalogItem.code,
      itemName: catalogItem.name,
      price: catalogItem.price,
      quantity: qty,
      totalPrice: catalogItem.price * qty,
      scannedBy: req.user.userId,
    });

    return res.status(201).json({
      message: "Extra item added successfully",
      extraCharge,
      student: {
        userId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        role: student.role,
        department: student.department,
        hostel: student.hostel,
        roomNo: student.roomNo,
      },
    });
  } catch (_error) {
    return res.status(400).json({ message: "Invalid QR data or request payload" });
  }
}

async function getMyExtras(req, res) {
  try {
    const items = await ExtraCharge.find({ userId: req.user.userId })
      .sort({ date: -1, time: -1 })
      .populate("scannedBy", "name username");

    return res.json(items);
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function getMyBill(req, res) {
  try {
    const bill = await buildStudentBill({
      userId: req.user.userId,
      month: req.query.month,
    });

    return res.json(bill);
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function getStudentBillForWorker(req, res) {
  try {
    const student = await resolveStudent(req.query.student);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const bill = await buildStudentBill({
      userId: student._id,
      month: req.query.month,
    });

    return res.json(bill);
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function createMessOff(req, res) {
  try {
    const { student, fromDate, toDate, mealType = "all" } = req.body;

    if (!student || !fromDate || !toDate) {
      return res.status(400).json({ message: "student, fromDate and toDate are required" });
    }

    if (fromDate > toDate) {
      return res.status(400).json({ message: "From date cannot be after to date" });
    }

    const resolvedStudent = await resolveStudent(student);
    if (!resolvedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const messOff = await MessOff.create({
      userId: resolvedStudent._id,
      fromDate,
      toDate,
      mealType,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      message: "Mess off saved successfully",
      messOff,
      student: {
        userId: resolvedStudent._id,
        name: resolvedStudent.name,
        rollNumber: resolvedStudent.rollNumber,
        username: resolvedStudent.username,
      },
    });
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function getMessOffs(req, res) {
  try {
    const query = {};

    if (req.query.student) {
      const student = await resolveStudent(req.query.student);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      query.userId = student._id;
    }

    const messOffs = await MessOff.find(query)
      .sort({ fromDate: -1, toDate: -1, createdAt: -1 })
      .populate("userId", "name rollNumber username")
      .populate("createdBy", "name username");

    return res.json(messOffs);
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getExtrasCatalog,
  addExtraCharge,
  getMyExtras,
  getMyBill,
  getStudentBillForWorker,
  createMessOff,
  getMessOffs,
};
