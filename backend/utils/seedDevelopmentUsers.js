const bcrypt = require("bcrypt");
const User = require("../models/User");
const { buildStudentQrPayload } = require("./buildStudentQrPayload");

const developmentUsers = [
  {
    username: "superadmin",
    password: "superadmin123",
    role: "superadmin",
    name: "Super Admin",
    department: "Administration",
  },
  {
    username: "dean",
    password: "dean123",
    role: "dean",
    name: "Dean Office",
    department: "Student Welfare",
  },
  {
    username: "worker",
    password: "worker123",
    role: "worker",
    name: "Mess Worker",
    hostel: "Main Mess",
  },
  {
    username: "student",
    password: "student123",
    role: "student",
    name: "Demo Student",
    rollNumber: "DEV-STUDENT-001",
    department: "Computer Science and Engineering",
    hostel: "Boys Hostel",
    roomNo: "B-203",
    phone: "9999999999",
  },
  {
    username: "student2",
    password: "student123",
    role: "student",
    name: "Aarav Sharma",
    rollNumber: "DEV-STUDENT-002",
    department: "Electrical Engineering",
    hostel: "Boys Hostel",
    roomNo: "C-114",
    phone: "8888888802",
  },
  {
    username: "student3",
    password: "student123",
    role: "student",
    name: "Meera Singh",
    rollNumber: "DEV-STUDENT-003",
    department: "Mechanical Engineering",
    hostel: "Girls Hostel",
    roomNo: "G-212",
    phone: "8888888803",
  },
];

function normalizeOptionalValue(value) {
  if (typeof value !== "string") {
    return value ?? undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

async function seedDevelopmentUsers() {
  for (const entry of developmentUsers) {
    const password = await bcrypt.hash(entry.password, 10);

    const existingUser = await User.findOne({ username: entry.username });
    if (existingUser) {
      existingUser.password = password;
      existingUser.role = entry.role;
      existingUser.name = normalizeOptionalValue(entry.name);
      existingUser.rollNumber = normalizeOptionalValue(entry.rollNumber);
      existingUser.department = normalizeOptionalValue(entry.department);
      existingUser.hostel = normalizeOptionalValue(entry.hostel);
      existingUser.phone = normalizeOptionalValue(entry.phone);
      existingUser.roomNo = normalizeOptionalValue(entry.roomNo);
      existingUser.qrCode =
        entry.role === "student" ? buildStudentQrPayload(existingUser) : undefined;
      await existingUser.save();
      continue;
    }

    const user = await User.create({
      ...entry,
      name: normalizeOptionalValue(entry.name),
      rollNumber: normalizeOptionalValue(entry.rollNumber),
      department: normalizeOptionalValue(entry.department),
      hostel: normalizeOptionalValue(entry.hostel),
      phone: normalizeOptionalValue(entry.phone),
      roomNo: normalizeOptionalValue(entry.roomNo),
      password,
    });

    if (user.role === "student") {
      user.qrCode = buildStudentQrPayload(user);
      await user.save();
    }
  }
}

module.exports = { seedDevelopmentUsers, developmentUsers };
