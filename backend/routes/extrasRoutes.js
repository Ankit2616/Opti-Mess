const express = require("express");

const {
  getExtrasCatalog,
  addExtraCharge,
  getMyExtras,
  getMyBill,
  getStudentBillForWorker,
  createMessOff,
  getMessOffs,
} = require("../controllers/extrasController");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/catalog", verifyToken, authorizeRoles(["worker", "student", "superadmin", "dean"]), getExtrasCatalog);
router.post("/add", verifyToken, authorizeRoles(["worker"]), addExtraCharge);
router.get("/my", verifyToken, authorizeRoles(["student"]), getMyExtras);
router.get("/my-bill", verifyToken, authorizeRoles(["student"]), getMyBill);
router.get("/student-bill", verifyToken, authorizeRoles(["worker", "superadmin", "dean"]), getStudentBillForWorker);
router.post("/mess-off", verifyToken, authorizeRoles(["worker"]), createMessOff);
router.get("/mess-off", verifyToken, authorizeRoles(["worker", "superadmin", "dean"]), getMessOffs);

module.exports = router;
