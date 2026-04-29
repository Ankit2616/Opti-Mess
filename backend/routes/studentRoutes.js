const express = require("express");

const { getStudentProfile } = require("../controllers/studentController");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/me", verifyToken, authorizeRoles(["student"]), getStudentProfile);

module.exports = router;
