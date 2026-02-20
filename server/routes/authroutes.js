const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authmiddleware");

const {
  register,
  login,
  getAccountSettings,
  changePassword,
  requestEmailUpdate,
  verifyEmailUpdate,
  getLoginActivity,
  logoutAllDevices,
  deleteAccount
} = require("../controllers/authcontroller");

router.get("/ping", (req, res) => {
  res.send("Auth routes alive");
});


router.post("/register", register);
router.post("/login", login);
router.get("/account/settings", protect, getAccountSettings);
router.post("/account/change-password", protect, changePassword);
router.post("/account/request-email-update", protect, requestEmailUpdate);
router.post("/account/verify-email-update", protect, verifyEmailUpdate);
router.get("/account/login-activity", protect, getLoginActivity);
router.post("/account/logout-all-devices", protect, logoutAllDevices);
router.delete("/account/delete", protect, deleteAccount);

module.exports = router;
