const express = require("express");

const {
  createUser,
  deleteUser,
  getAllUsers,
  regenerateQr,
} = require("../controllers/adminController");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.use(verifyToken, authorizeRoles(["superadmin"]));

router.post("/create-user", createUser);
router.delete("/delete-user/:id", deleteUser);
router.get("/all-users", getAllUsers);
router.post("/regenerate-qr/:id", regenerateQr);

module.exports = router;
