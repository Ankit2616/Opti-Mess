const Attendance = require("../models/Attendance");

async function fixAttendanceIndexes() {
  const collection = Attendance.collection;
  const indexes = await collection.indexes();
  const dailyIndex = indexes.find((index) => index.name === "userId_1_date_1");

  if (dailyIndex) {
    await collection.dropIndex("userId_1_date_1");
  }

  await Attendance.syncIndexes();
}

module.exports = { fixAttendanceIndexes };
