const Job = require("../models/job");
const User = require("../models/user");

const publicEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "protonmail.com"
];

const hasCorporateEmail = (email = "") => {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();
  return !publicEmailDomains.includes(domain);
};

const isRecruiterVerified = (recruiter = {}) => {
  const rp = recruiter.recruiterProfile || {};
  return Boolean(hasCorporateEmail(rp.workEmail) || rp.linkedinProfileUrl);
};

const normalizeSkill = (skill = "") => skill.trim().toLowerCase();
const uniqueSkills = (skills = []) => [...new Set(skills.map(normalizeSkill).filter(Boolean))];

const getMatchData = (userSkills = [], requiredSkills = []) => {
  const userSet = new Set(uniqueSkills(userSkills));
  const req = uniqueSkills(requiredSkills);
  const matched = req.filter((skill) => userSet.has(skill));
  const missing = req.filter((skill) => !userSet.has(skill));
  const matchPercentage = req.length === 0 ? 0 : Math.round((matched.length / req.length) * 100);
  return { matched, missing, matchPercentage };
};

const canManageJob = (job, userId) => {
  if (!job) return false;
  if (job.postedBy?.toString() === userId) return true;
  return (job.recruiters || []).some((id) => id.toString() === userId);
};

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      salary,
      description,
      requiredSkills,
      status,
      expiryDate,
      recruiters
    } = req.body;

    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: "Title and Company are required"
      });
    }

    const recruiterIds = [req.user.id, ...((recruiters || []).map(String))];
    const uniqueRecruiters = [...new Set(recruiterIds)];

    const job = await Job.create({
      title,
      company,
      salary: salary || "",
      description,
      requiredSkills,
      status: status || "open",
      expiryDate: expiryDate || null,
      recruiters: uniqueRecruiters,
      postedBy: req.user.id
    });

    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error("CREATE JOB ERROR", error);
    return res.status(500).json({ success: false, message: "Job creation failed" });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const now = new Date();
    let query = {};

    if (req.user?.role === "student") {
      query = {
        status: "open",
        $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }]
      };
    }

    if (req.user?.role === "recruiter") {
      query = {
        $or: [{ postedBy: req.user.id }, { recruiters: req.user.id }]
      };
    }

    const jobs = await Job.find(query)
      .populate(
        "postedBy",
        [
          "name",
          "email",
          "recruiterProfile.jobTitle",
          "recruiterProfile.professionalBio",
          "recruiterProfile.linkedinProfileUrl",
          "recruiterProfile.profilePictureUrl",
          "recruiterProfile.companyName",
          "recruiterProfile.companyLogoUrl",
          "recruiterProfile.companyIndustry",
          "recruiterProfile.companyWebsite",
          "recruiterProfile.companySize",
          "recruiterProfile.officeLocation",
          "recruiterProfile.workEmail",
          "recruiterProfile.workPhoneNumber",
          "recruiterProfile.preferredCommunicationMethod",
          "recruiterProfile.availabilityResponseTime",
          "recruiterProfile.hiringDomains",
          "recruiterProfile.seniorityLevels"
        ].join(" ")
      )
      .populate("recruiters", "name email recruiterProfile.jobTitle")
      .sort({ createdAt: -1 });

    let studentSkills = [];
    if (req.user?.role === "student") {
      const student = await User.findById(req.user.id).select("skills");
      studentSkills = student?.skills || [];
    }

    const data = jobs.map((job) => {
      const item = job.toObject();
      if (item.postedBy) {
        item.postedBy.recruiterVerified = isRecruiterVerified(item.postedBy);
      }
      if (req.user?.role === "student") {
        const match = getMatchData(studentSkills, item.requiredSkills || []);
        item.matchPercentage = match.matchPercentage;
        item.matchedSkills = match.matched;
        item.missingSkills = match.missing;
      }
      return item;
    });

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("FETCH JOB ERROR", error);
    return res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

exports.getRecommendedJobs = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select("skills");
    if (!student) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const now = new Date();
    const jobs = await Job.find({
      status: "open",
      $or: [{ expiryDate: null }, { expiryDate: { $gte: now } }]
    }).populate(
      "postedBy",
      "name recruiterProfile.companyName recruiterProfile.companyLogoUrl recruiterProfile.profilePictureUrl"
    );

    const recommendations = jobs
      .map((job) => {
        const match = getMatchData(student.skills || [], job.requiredSkills || []);
        return {
          ...job.toObject(),
          matchPercentage: match.matchPercentage,
          matchedSkills: match.matched,
          missingSkills: match.missing
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 10);

    return res.json({ success: true, data: recommendations });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch recommendations" });
  }
};

exports.getJobMatchPreview = async (req, res) => {
  try {
    const { jobId } = req.params;
    const [student, job] = await Promise.all([
      User.findById(req.user.id).select("skills"),
      Job.findById(jobId).select("title requiredSkills")
    ]);

    if (!student || !job) {
      return res.status(404).json({ success: false, message: "User or job not found" });
    }

    const match = getMatchData(student.skills || [], job.requiredSkills || []);
    return res.json({ success: true, job: { _id: job._id, title: job.title }, ...match });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch job match" });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (!canManageJob(job, req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this job" });
    }

    const allowed = {
      title: req.body.title,
      company: req.body.company,
      salary: req.body.salary || "",
      description: req.body.description,
      requiredSkills: req.body.requiredSkills,
      status: req.body.status,
      expiryDate: req.body.expiryDate
    };

    const updatedJob = await Job.findByIdAndUpdate(jobId, allowed, { new: true });
    return res.status(200).json({ success: true, data: updatedJob });
  } catch (error) {
    console.error("UPDATE JOB ERROR", error);
    return res.status(500).json({ success: false, message: "Failed to update job" });
  }
};

exports.updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    if (!["draft", "open", "closed", "archived"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid job status" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (!canManageJob(job, req.user.id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    job.status = status;
    await job.save();

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update job status" });
  }
};

exports.addRecruiterToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { recruiterId } = req.body;

    const [job, recruiter, owner] = await Promise.all([
      Job.findById(jobId),
      User.findById(recruiterId),
      User.findById(req.user.id)
    ]);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(400).json({ success: false, message: "Invalid recruiter" });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only job owner can add recruiters" });
    }

    const ownerCompany = owner?.recruiterProfile?.companyName || "";
    const targetCompany = recruiter?.recruiterProfile?.companyName || "";
    if (ownerCompany && targetCompany && ownerCompany !== targetCompany) {
      return res.status(400).json({ success: false, message: "Recruiter must belong to same company" });
    }

    const current = (job.recruiters || []).map((id) => id.toString());
    if (!current.includes(recruiterId)) {
      job.recruiters.push(recruiterId);
      await job.save();
    }

    return res.status(200).json({ success: true, data: job });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to add recruiter" });
  }
};

exports.getCompanyProfile = async (req, res) => {
  try {
    const companyName = decodeURIComponent(req.params.companyName);
    const recruiters = await User.find({
      role: "recruiter",
      "recruiterProfile.companyName": companyName
    }).select("name email recruiterProfile");

    const jobs = await Job.find({ company: companyName }).select(
      "title company status expiryDate requiredSkills createdAt"
    );

    return res.json({
      success: true,
      data: {
        companyName,
        recruiters,
        jobs
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch company profile" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this job" });
    }

    await Job.findByIdAndDelete(jobId);

    return res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("DELETE JOB ERROR", error);
    return res.status(500).json({ success: false, message: "Failed to delete job" });
  }
};
