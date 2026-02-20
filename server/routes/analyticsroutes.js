const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authmiddleware");
const { getOverview } = require("../controllers/analyticscontroller");

router.get(
  "/overview",
  protect,
  authorize("recruiter"),
  getOverview
);

module.exports = router;
