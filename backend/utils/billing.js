const Attendance = require("../models/Attendance");
const ExtraCharge = require("../models/ExtraCharge");
const MessOff = require("../models/MessOff");
const User = require("../models/User");
const { MEAL_RATES } = require("./messCatalog");

function getMonthRange(month) {
  const normalizedMonth =
    month && /^\d{4}-\d{2}$/.test(month)
      ? month
      : new Date().toISOString().slice(0, 7);
  return {
    month: normalizedMonth,
    start: `${normalizedMonth}-01`,
    end: `${normalizedMonth}-31`,
  };
}

async function resolveStudent(identifier) {
  if (!identifier) return null;

  return User.findOne({
    role: "student",
    $or: [{ _id: identifier }, { rollNumber: identifier }, { username: identifier }],
  }).select("-password");
}

async function buildStudentBill({ userId, month }) {
  const { start, end, month: normalizedMonth } = getMonthRange(month);

  const [attendanceEntries, extraCharges, messOffEntries, student] = await Promise.all([
    Attendance.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1, time: 1 }),
    ExtraCharge.find({
      userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1, time: 1 }),
    MessOff.find({
      userId,
      fromDate: { $lte: end },
      toDate: { $gte: start },
    }).sort({ fromDate: 1, toDate: 1 }),
    User.findById(userId).select("-password"),
  ]);

  const isMealCoveredByMessOff = (entry) =>
    messOffEntries.some(
      (item) =>
        entry.date >= item.fromDate &&
        entry.date <= item.toDate &&
        (item.mealType === "all" || item.mealType === entry.mealType)
    );

  const attendanceItems = attendanceEntries.map((entry) => {
    const excluded = isMealCoveredByMessOff(entry);

    return {
      _id: entry._id,
      date: entry.date,
      mealType: entry.mealType,
      time: entry.time,
      rate: excluded ? 0 : MEAL_RATES[entry.mealType] || 0,
      excludedByMessOff: excluded,
    };
  });

  const attendanceTotal = attendanceItems.reduce((sum, item) => sum + item.rate, 0);
  const extrasTotal = extraCharges.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    month: normalizedMonth,
    student,
    mealRates: MEAL_RATES,
    attendanceItems,
    extraItems: extraCharges,
    messOffItems: messOffEntries,
    summary: {
      attendanceTotal,
      extrasTotal,
      grandTotal: attendanceTotal + extrasTotal,
    },
  };
}

module.exports = {
  MEAL_RATES,
  getMonthRange,
  resolveStudent,
  buildStudentBill,
};
