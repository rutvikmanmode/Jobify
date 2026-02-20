const Application = require("../models/application");
const Job = require("../models/job");
const User = require("../models/user");

const normalizeSkill = (skill = "") => skill.trim().toLowerCase();
const uniqueSkills = (skills = []) => [...new Set(skills.map(normalizeSkill).filter(Boolean))];

const getMatchData = (userSkills = [], requiredSkills = []) => {
  const userSet = new Set(uniqueSkills(userSkills));
  const req = uniqueSkills(requiredSkills);
  const matched = req.filter((skill) => userSet.has(skill));
  const missing = req.filter((skill) => !userSet.has(skill));
  const score = req.length === 0 ? 0 : Math.round((matched.length / req.length) * 100);
  return { matched, missing, score };
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("job", "title company requiredSkills status expiryDate")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error("MY APPLICATIONS ERROR", error);
    return res.status(500).json({ success: false, message: "Failed to fetch your applications" });
  }
};

exports.previewApplicationScore = async (req, res) => {
  try {
    const { jobId } = req.params;
    const [job, user] = await Promise.all([Job.findById(jobId), User.findById(req.user.id)]);

    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const match = getMatchData(user.skills || [], job.requiredSkills || []);

    return res.json({
      success: true,
      job: { _id: job._id, title: job.title, company: job.company },
      score: match.score,
      matchedSkills: match.matched,
      missingSkills: match.missing
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to preview score" });
  }
};

exports.applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.status !== "open") {
      return res.status(400).json({ success: false, message: "Job is not open for applications" });
    }

    if (job.expiryDate && new Date(job.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: "Job application deadline has passed" });
    }

    const user = await User.findById(req.user.id);
    if (!user.skills || user.skills.length === 0) {
      return res.status(400).json({ success: false, message: "Upload resume before applying" });
    }

    const existingApplication = await Application.findOne({ student: req.user.id, job: jobId });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: "You already applied to this job" });
    }

    const match = getMatchData(user.skills || [], job.requiredSkills || []);

    await Application.create({
      student: req.user.id,
      job: job._id,
      score: match.score,
      status: "Applied",
      statusUpdatedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Applied successfully",
      score: match.score,
      matchedSkills: match.matched,
      missingSkills: match.missing
    });
  } catch (error) {
    console.error("APPLICATION ERROR", error);
    return res.status(500).json({ success: false, message: "Application failed" });
  }
};

exports.autoApplyMatchingJobs = async (req, res) => {
  try {
    const threshold = Math.max(0, Math.min(100, Number(req.body.threshold ?? 70)));
    const now = new Date();

    const [jobs, user, existingApplications] = await Promise.all([
      Job.find({ status: "open", $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }] }).select(
        "title company requiredSkills"
      ),
      User.findById(req.user.id).select("skills"),
      Application.find({ student: req.user.id }).select("job")
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const appliedSet = new Set(existingApplications.map((a) => String(a.job)));
    const applied = [];

    for (const job of jobs) {
      if (appliedSet.has(String(job._id))) continue;
      const match = getMatchData(user.skills || [], job.requiredSkills || []);
      if (match.score < threshold) continue;

      await Application.create({
        student: req.user.id,
        job: job._id,
        score: match.score,
        status: "Applied",
        statusUpdatedAt: new Date()
      });

      applied.push({ jobId: job._id, title: job.title, company: job.company, score: match.score });
    }

    return res.json({ success: true, threshold, appliedCount: applied.length, applied });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Auto-apply failed" });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      minScore,
      maxScore,
      skill,
      education,
      experience,
      status,
      shortlisted
    } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const isManager =
      job.postedBy.toString() === req.user.id ||
      (job.recruiters || []).some((id) => id.toString() === req.user.id);

    if (!isManager) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const query = { job: jobId };
    if (status) query.status = status;
    if (typeof shortlisted !== "undefined") {
      query.shortlisted = shortlisted === "true";
    }

    if (minScore || maxScore) {
      query.score = {};
      if (minScore) query.score.$gte = Number(minScore);
      if (maxScore) query.score.$lte = Number(maxScore);
    }

    let applications = await Application.find(query)
      .populate(
        "student",
        "name email skills profilePhoto resume headline bio phone location university degree specialization linkedin github portfolio internships"
      )
      .sort({ score: -1 });

    if (skill) {
      const s = skill.toLowerCase();
      applications = applications.filter((app) =>
        (app.student?.skills || []).some((item) => String(item).toLowerCase().includes(s))
      );
    }

    if (education) {
      const e = education.toLowerCase();
      applications = applications.filter((app) => {
        const uni = app.student?.university || "";
        const degree = app.student?.degree || "";
        return uni.toLowerCase().includes(e) || degree.toLowerCase().includes(e);
      });
    }

    if (experience) {
      const minExp = Number(experience);
      if (!Number.isNaN(minExp)) {
        applications = applications.filter(
          (app) => (app.student?.internships || []).length >= minExp
        );
      }
    }

    return res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error("FETCH APPLICATIONS ERROR", error);
    return res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!["Applied", "Screening", "Interview", "Offered", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const app = await Application.findById(applicationId).populate("job", "postedBy recruiters");
    if (!app) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const isManager =
      app.job?.postedBy?.toString() === req.user.id ||
      (app.job?.recruiters || []).some((id) => id.toString() === req.user.id);

    if (!isManager) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    app.status = status;
    app.statusUpdatedAt = new Date();
    await app.save();

    return res.json({ success: true, data: app });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

exports.updateApplicationReview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { shortlisted, internalNotes } = req.body;

    const app = await Application.findById(applicationId).populate("job", "postedBy recruiters");
    if (!app) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const isManager =
      app.job?.postedBy?.toString() === req.user.id ||
      (app.job?.recruiters || []).some((id) => id.toString() === req.user.id);

    if (!isManager) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (typeof shortlisted !== "undefined") {
      app.shortlisted = Boolean(shortlisted);
    }
    if (typeof internalNotes === "string") {
      app.internalNotes = internalNotes;
    }

    await app.save();
    return res.json({ success: true, data: app });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update review details" });
  }
};
