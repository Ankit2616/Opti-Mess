const Attendance = require("../models/Attendance");
const User = require("../models/User");

function getIndiaDateParts(dateString, timeString) {
  const date = dateString || new Date().toISOString().slice(0, 10);
  const time = timeString || new Date().toLocaleTimeString("en-IN", {
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  return { date, time };
}

function getMealType(timeString) {
  const [hoursString = "0"] = String(timeString || "00:00:00").split(":");
  const hours = Number(hoursString);

  if (hours >= 5 && hours < 11) {
    return "breakfast";
  }

  if (hours >= 11 && hours < 16) {
    return "lunch";
  }

  return "dinner";
}

async function upsertAttendanceEntry({
  userId,
  date,
  time,
  mealType,
  status = "present",
  scannedBy,
}) {
  try {
    const doc = await Attendance.findOneAndUpdate(
      { userId, date, mealType },
      {
        $setOnInsert: {
          userId,
          date,
          time,
          mealType,
          status,
          scannedBy,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return { doc, created: doc.createdAt.getTime() === doc.updatedAt.getTime() };
  } catch (error) {
    if (error.code === 11000) {
      const existing = await Attendance.findOne({ userId, date, mealType });
      return { doc: existing, created: false };
    }
    throw error;
  }
}

async function markAttendance(req, res) {
  try {
    const { qrData, userId, date: inputDate, time: inputTime, status } = req.body;

    let resolvedUserId = userId;

    if (!resolvedUserId && qrData) {
      const parsedQr = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
      resolvedUserId = parsedQr.userId;
    }

    if (!resolvedUserId) {
      return res.status(400).json({ message: "userId or qrData is required" });
    }

    const student = await User.findById(resolvedUserId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const { date, time } = getIndiaDateParts(inputDate, inputTime);
    const mealType = getMealType(time);
    const { doc, created } = await upsertAttendanceEntry({
      userId: resolvedUserId,
      date,
      time,
      mealType,
      status,
      scannedBy: req.user.userId,
    });

    return res.status(created ? 201 : 200).json({
      message: created
        ? `${mealType} attendance marked successfully`
        : `${mealType} attendance already exists for this student today`,
      attendance: doc,
      student: {
        userId: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        role: student.role,
        department: student.department,
        hostel: student.hostel,
        roomNo: student.roomNo,
        phone: student.phone,
      },
      mealType,
      duplicate: !created,
    });
  } catch (_error) {
    return res.status(400).json({ message: "Invalid QR data or request payload" });
  }
}

async function syncAttendance(req, res) {
  try {
    const entries = Array.isArray(req.body.attendance) ? req.body.attendance : [];

    const results = [];

    for (const entry of entries) {
      const { userId, qrData, date: inputDate, time: inputTime, status } = entry;
      let resolvedUserId = userId;

      if (!resolvedUserId && qrData) {
        const parsedQr = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
        resolvedUserId = parsedQr.userId;
      }

      if (!resolvedUserId) {
        results.push({ ...entry, synced: false, reason: "Missing userId" });
        continue;
      }

      const student = await User.findById(resolvedUserId);
      if (!student || student.role !== "student") {
        results.push({
          ...entry,
          synced: false,
          reason: "Student not found",
        });
        continue;
      }

      const { date, time } = getIndiaDateParts(inputDate, inputTime);
      const mealType = getMealType(time);
      const { created } = await upsertAttendanceEntry({
        userId: resolvedUserId,
        date,
        time,
        mealType,
        status,
        scannedBy: req.user.userId,
      });

      results.push({
        userId: resolvedUserId,
        date,
        mealType,
        synced: true,
        duplicate: !created,
      });
    }

    return res.json({
      message: "Attendance sync completed",
      results,
    });
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function getStudentAttendance(req, res) {
  try {
    const attendance = await Attendance.find({ userId: req.user.userId })
      .sort({ date: -1, createdAt: -1 })
      .populate("scannedBy", "name username role");

    return res.json(attendance);
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  markAttendance,
  syncAttendance,
  getStudentAttendance,
  getMealType,
};
