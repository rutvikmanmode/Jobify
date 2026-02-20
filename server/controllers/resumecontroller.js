const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const User = require("../models/user");
const Job = require("../models/job");

const SKILL_BANK = [
  "javascript", "typescript", "node", "express", "react", "next.js", "mongodb",
  "mysql", "postgresql", "sql", "redis", "java", "spring", "python", "django",
  "flask", "c", "c++", "c#", "go", "rust", "php", "laravel", "html", "css",
  "tailwind", "bootstrap", "redux", "graphql", "rest api", "microservices", "docker",
  "kubernetes", "aws", "gcp", "azure", "git", "github", "ci/cd", "linux", "firebase",
  "machine learning", "data analysis", "pandas", "numpy", "tensorflow", "pytorch"
];

const normalizeSkill = (value = "") => value.trim().toLowerCase();

const toUniqueSkills = (skills = []) => {
  return [...new Set(skills.map(normalizeSkill).filter(Boolean))];
};

const extractSkills = (text = "") => {
  const lower = text.toLowerCase();
  return SKILL_BANK.filter((skill) => lower.includes(skill));
};

const computeResumeSuggestions = (resumeText = "", skills = [], targetSkills = []) => {
  const suggestions = [];
  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;

  if (wordCount < 180) {
    suggestions.push("Increase resume detail: add measurable impact and project outcomes.");
  }
  if (!/project|projects/i.test(resumeText)) {
    suggestions.push("Add a dedicated Projects section with tech stack and results.");
  }
  if (!/experience|internship|work/i.test(resumeText)) {
    suggestions.push("Include internship/work experience with action verbs and achievements.");
  }
  if (!/github|linkedin|portfolio/i.test(resumeText)) {
    suggestions.push("Add GitHub/LinkedIn/Portfolio links to improve recruiter trust.");
  }

  const normalizedUserSkills = new Set(toUniqueSkills(skills));
  const normalizedTargetSkills = toUniqueSkills(targetSkills);
  const missingTargetSkills = normalizedTargetSkills.filter(
    (skill) => !normalizedUserSkills.has(skill)
  );

  if (missingTargetSkills.length > 0) {
    suggestions.push(
      `Consider adding evidence for these job-relevant skills: ${missingTargetSkills.slice(0, 8).join(", ")}`
    );
  }

  return suggestions;
};

const getTopMissingSkills = (userSkills = [], marketSkills = [], limit = 5) => {
  const userSet = new Set(toUniqueSkills(userSkills));
  const frequency = new Map();

  for (const skill of marketSkills) {
    const key = normalizeSkill(skill);
    if (!key || userSet.has(key)) continue;
    frequency.set(key, (frequency.get(key) || 0) + 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([skill]) => skill);
};

const generateAiStyleResumeTips = ({
  resumeText = "",
  skills = [],
  targetSkills = [],
  marketSkills = []
}) => {
  const tips = [];
  const normalizedSkills = toUniqueSkills(skills);
  const wordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;

  if (!resumeText || wordCount < 60) {
    tips.push("Add more resume content. Aim for 300-600 words with concrete achievements.");
  }

  if (!/\b\d+%|\b\d+\+|\b\d+\s*(users|requests|clients|days|weeks|months)\b/i.test(resumeText)) {
    tips.push("Include measurable impact (for example: reduced API latency by 35%, served 10k+ users).");
  }

  if (!/\b(project|projects)\b/i.test(resumeText)) {
    tips.push("Add a Projects section with role, stack, and business result for each project.");
  }

  if (!/\b(experience|internship|work)\b/i.test(resumeText)) {
    tips.push("Add internship/work experience bullets starting with strong action verbs.");
  }

  if (!/\b(github|linkedin|portfolio)\b/i.test(resumeText)) {
    tips.push("Include GitHub, LinkedIn, or portfolio links to improve recruiter trust.");
  }

  if (normalizedSkills.length < 6) {
    tips.push("Expand your visible skill set to at least 8-12 relevant technical skills.");
  }

  const missingTargetSkills = toUniqueSkills(targetSkills).filter(
    (skill) => !normalizedSkills.includes(skill)
  );
  if (missingTargetSkills.length > 0) {
    tips.push(`For your target role, add proof of: ${missingTargetSkills.slice(0, 6).join(", ")}.`);
  }

  const marketGaps = getTopMissingSkills(normalizedSkills, marketSkills, 5);
  if (marketGaps.length > 0) {
    tips.push(`High-demand skills missing from your profile: ${marketGaps.join(", ")}.`);
  }

  tips.push("Tailor your top 3 bullets to the exact job title before applying.");

  return [...new Set(tips)].slice(0, 8);
};

const getMatchData = (userSkills = [], requiredSkills = []) => {
  const userSet = new Set(toUniqueSkills(userSkills));
  const req = toUniqueSkills(requiredSkills);
  const matched = req.filter((skill) => userSet.has(skill));
  const missing = req.filter((skill) => !userSet.has(skill));
  const matchPercentage = req.length === 0 ? 0 : Math.round((matched.length / req.length) * 100);

  return { matched, missing, matchPercentage };
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const filePath = path.resolve(req.file.path);
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("Failed to extract text from PDF");
    }

    const extractedSkills = extractSkills(data.text);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user.resume = `uploads/${req.file.filename}`;
    user.resumeText = data.text;
    user.skills = toUniqueSkills([...(user.skills || []), ...extractedSkills]);
    user.resumeVersions = user.resumeVersions || [];
    user.resumeVersions.push({
      resumePath: `uploads/${req.file.filename}`,
      resumeText: data.text,
      extractedSkills,
      source: "upload"
    });

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Resume parsed successfully",
      skills: user.skills,
      extractedSkills,
      pages: data.numpages,
      suggestions: computeResumeSuggestions(data.text, user.skills)
    });
  } catch (error) {
    console.error("PDF parsing error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to parse resume",
      details: error.message
    });
  }
};

exports.viewResumeInline = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, "..", "uploads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    return res.sendFile(filePath);
  } catch (error) {
    console.error("Resume stream error:", error.message);
    return res.status(500).json({ message: "Failed to load resume" });
  }
};

exports.getResumeHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("resume resumeVersions");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const versions = (user.resumeVersions || []).slice().sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.json({
      success: true,
      currentResume: user.resume || null,
      versions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch resume history" });
  }
};

exports.saveResumeBuilder = async (req, res) => {
  try {
    const builder = req.body || {};
    const sections = [
      builder.fullName,
      builder.title,
      builder.summary,
      ...(builder.experience || []),
      ...(builder.education || []),
      ...(builder.projects || []),
      ...(builder.certifications || [])
    ];

    const builtText = sections.filter(Boolean).join("\n");
    const extractedSkills = extractSkills(builtText);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.resumeBuilder = {
      fullName: builder.fullName || "",
      title: builder.title || "",
      summary: builder.summary || "",
      experience: builder.experience || [],
      education: builder.education || [],
      projects: builder.projects || [],
      certifications: builder.certifications || []
    };

    user.resumeText = builtText;
    user.skills = toUniqueSkills([...(user.skills || []), ...extractedSkills]);
    user.resumeVersions = user.resumeVersions || [];
    user.resumeVersions.push({
      resumePath: null,
      resumeText: builtText,
      extractedSkills,
      source: "builder"
    });

    await user.save();

    return res.json({
      success: true,
      message: "Resume builder saved",
      builtText,
      skills: user.skills
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to save resume builder" });
  }
};

exports.getResumeBuilder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("resumeBuilder");
    return res.json({ success: true, data: user?.resumeBuilder || {} });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch resume builder" });
  }
};

exports.getResumeScorePreview = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.user.id).select("skills resumeText");
    const job = await Job.findById(jobId).select("title requiredSkills");

    if (!user || !job) {
      return res.status(404).json({ success: false, message: "User or job not found" });
    }

    const match = getMatchData(user.skills || [], job.requiredSkills || []);
    const suggestions = computeResumeSuggestions(
      user.resumeText || "",
      user.skills || [],
      job.requiredSkills || []
    );

    return res.json({
      success: true,
      job: {
        _id: job._id,
        title: job.title
      },
      matchPercentage: match.matchPercentage,
      matchedSkills: match.matched,
      missingSkills: match.missing,
      suggestions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to generate score preview" });
  }
};

exports.getSkillSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("skills resumeText");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const extracted = extractSkills(user.resumeText || "");
    const current = new Set(toUniqueSkills(user.skills || []));
    const suggestions = extracted.filter((skill) => !current.has(normalizeSkill(skill)));

    return res.json({ success: true, suggestions: toUniqueSkills(suggestions) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch skill suggestions" });
  }
};

exports.addSkillTag = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill || typeof skill !== "string") {
      return res.status(400).json({ success: false, message: "Skill is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.skills = toUniqueSkills([...(user.skills || []), skill]);
    await user.save();

    return res.json({ success: true, skills: user.skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to add skill" });
  }
};

exports.removeSkillTag = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill || typeof skill !== "string") {
      return res.status(400).json({ success: false, message: "Skill is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const target = normalizeSkill(skill);
    user.skills = toUniqueSkills((user.skills || []).filter((item) => normalizeSkill(item) !== target));
    await user.save();

    return res.json({ success: true, skills: user.skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to remove skill" });
  }
};

exports.getResumeImprovementSuggestions = async (req, res) => {
  try {
    const { jobId } = req.query;
    const user = await User.findById(req.user.id).select("resumeText skills");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let targetSkills = [];
    if (jobId) {
      const job = await Job.findById(jobId).select("requiredSkills");
      targetSkills = job?.requiredSkills || [];
    }

    const baselineSuggestions = computeResumeSuggestions(
      user.resumeText || "",
      user.skills || [],
      targetSkills
    );

    const marketJobs = await Job.find({}).select("requiredSkills").limit(100);
    const marketSkills = marketJobs.flatMap((job) => job.requiredSkills || []);

    const aiSuggestions = generateAiStyleResumeTips({
      resumeText: user.resumeText || "",
      skills: user.skills || [],
      targetSkills,
      marketSkills
    });

    const suggestions = [...new Set([...aiSuggestions, ...baselineSuggestions])].slice(0, 10);

    return res.json({
      success: true,
      suggestions,
      source: "ai-heuristic"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch improvement suggestions" });
  }
};
