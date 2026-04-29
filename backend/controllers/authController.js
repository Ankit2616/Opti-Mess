const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      {
        userId: String(user._id),
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      role: user.role,
      user: {
        userId: String(user._id),
        username: user.username,
        role: user.role,
        name: user.name,
        rollNumber: user.rollNumber,
      },
    });
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (_error) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  login,
  getCurrentUser,
};
