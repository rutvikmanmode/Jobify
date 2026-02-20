const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authmiddleware");

const {
  createJob,
  getJobs,
  getRecommendedJobs,
  getJobMatchPreview,
  updateJobStatus,
  addRecruiterToJob,
  getCompanyProfile,
  updateJob,
  deleteJob
} = require("../controllers/jobcontroller");


// 🏢 Create Job (Recruiter only)
router.post(
  "/",
  protect,
  authorize("recruiter"),
  createJob
);


// 📋 Get All Jobs (Logged in users)
router.get(
  "/",
  protect,
  getJobs
);

router.get(
  "/recommended",
  protect,
  authorize("student"),
  getRecommendedJobs
);

router.get(
  "/match/:jobId",
  protect,
  authorize("student"),
  getJobMatchPreview
);

router.get(
  "/company/:companyName",
  protect,
  getCompanyProfile
);

router.patch(
  "/:jobId/status",
  protect,
  authorize("recruiter"),
  updateJobStatus
);

router.post(
  "/:jobId/recruiters",
  protect,
  authorize("recruiter"),
  addRecruiterToJob
);


// ✏️ Update Job (Recruiter only)
router.put(
  "/:jobId",
  protect,
  authorize("recruiter"),
  updateJob
);


// ❌ Delete Job (Recruiter only)
router.delete(
  "/:jobId",
  protect,
  authorize("recruiter"),
  deleteJob
);

module.exports = router;
