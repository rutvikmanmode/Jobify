const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authmiddleware");

const {
  applyJob,
  unapplyJob,
  previewApplicationScore,
  autoApplyMatchingJobs,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  updateApplicationReview
} = require("../controllers/applicationcontroller");

// Student views own applications
router.get(
  "/my",
  protect,
  authorize("student"),
  getMyApplications
);

router.get(
  "/preview/:jobId",
  protect,
  authorize("student"),
  previewApplicationScore
);

router.post(
  "/auto-apply",
  protect,
  authorize("student"),
  autoApplyMatchingJobs
);

// Recruiter views applicants for a job
router.get(
  "/job/:jobId",
  protect,
  authorize("recruiter"),
  getJobApplications
);

router.patch(
  "/:applicationId/status",
  protect,
  authorize("recruiter"),
  updateApplicationStatus
);

router.patch(
  "/:applicationId/review",
  protect,
  authorize("recruiter"),
  updateApplicationReview
);

// Student applies to a job
router.post(
  "/:jobId",
  protect,
  authorize("student"),
  applyJob
);

router.delete(
  "/:jobId",
  protect,
  authorize("student"),
  unapplyJob
);

module.exports = router;
