const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const studentRoutes = require("./routes/studentRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const extrasRoutes = require("./routes/extrasRoutes");
const { seedDevelopmentUsers } = require("./utils/seedDevelopmentUsers");
const { fixUserIndexes } = require("./utils/fixUserIndexes");
const { fixAttendanceIndexes } = require("./utils/fixAttendanceIndexes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Opti-Mess API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/extras", extrasRoutes);

// Backward-compatible login alias for older frontend calls during migration.
app.post("/login", require("./controllers/authController").login);

const PORT = 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017/messDB";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");
    await fixUserIndexes();
    await fixAttendanceIndexes();
    await seedDevelopmentUsers();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Mongo connection failed", error);
  });
