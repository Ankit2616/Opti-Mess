const bcrypt = require("bcrypt");

const User = require("../models/User");
const { buildStudentQrPayload } = require("../utils/buildStudentQrPayload");

function normalizeOptionalValue(value) {
  if (typeof value !== "string") {
    return value ?? undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

async function createUser(req, res) {
  try {
    const {
      username,
      password,
      role,
      name,
      rollNumber,
      department,
      hostel,
      phone,
      roomNo,
      aadharNumber,
    } = req.body;

    if (!username || !password || !role) {
      return res
        .status(400)
        .json({ message: "username, password and role are required" });
    }

    if (role === "superadmin") {
      return res
        .status(400)
        .json({ message: "Super admin cannot be created from this panel" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      role,
      name: normalizeOptionalValue(name),
      rollNumber: normalizeOptionalValue(rollNumber),
      department: normalizeOptionalValue(department),
      hostel: normalizeOptionalValue(hostel),
      phone: normalizeOptionalValue(phone),
      roomNo: normalizeOptionalValue(roomNo),
      aadharNumber: normalizeOptionalValue(aadharNumber),
    });

    if (user.role === "student") {
      user.qrCode = buildStudentQrPayload(user);
      await user.save();
    }

    return res.status(201).json({
      message: "User created successfully",
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "superadmin") {
      return res
        .status(400)
        .json({ message: "Super admin account cannot be deleted" });
    }

    await User.findByIdAndDelete(req.params.id);
    return res.json({ message: "User deleted successfully" });
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function getAllUsers(_req, res) {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function regenerateQr(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    user.qrCode = buildStudentQrPayload(user);
    await user.save();

    return res.json({
      message: "QR code regenerated successfully",
      qrCode: user.qrCode,
    });
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createUser,
  deleteUser,
  getAllUsers,
  regenerateQr,
};
