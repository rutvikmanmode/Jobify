const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // 🔐 Authentication
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["student", "recruiter", "admin"],
    default: "student"
  },
  emailVerified: {
    type: Boolean,
    default: true
  },
  pendingEmail: {
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    verificationCode: String,
    expiresAt: Date,
    requestedAt: Date
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  tokenVersion: {
    type: Number,
    default: 0
  },
  passwordChangedAt: Date,
  loginActivity: [
    {
      ip: String,
      userAgent: String,
      loggedInAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Recruiter profile (editable by recruiter)
  recruiterProfile: {
    // 1) Personal & Professional Identity
    jobTitle: String,
    professionalBio: String,
    linkedinProfileUrl: String,
    profilePictureUrl: String,

    // 2) Company & Organization Details
    companyName: String,
    companyLogoUrl: String,
    companyIndustry: String,
    companyWebsite: String,
    companySize: String,
    officeLocation: String,

    // 3) Contact & Communication
    workEmail: String,
    workPhoneNumber: String,
    preferredCommunicationMethod: {
      type: String,
      enum: ["In-app messaging", "Email", "LinkedIn"]
    },
    availabilityResponseTime: String,

    // 4) Recruitment Focus
    hiringDomains: [String],
    seniorityLevels: [String],

    // 5) Recruiter Features & Tools (Internal)
    atsId: String,
    subscriptionTier: {
      type: String,
      enum: ["Free", "Premium", "Enterprise"],
      default: "Free"
    },
    jobPostingCredits: {
      type: Number,
      default: 0
    },
    notificationPreferences: {
      newApplications: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true }
    },
    teamAccess: [String]
  },

  // 🖼 Profile Photo
  profilePhoto: {
    type: String
  },

  // 🧾 Resume
  resume: {
    type: String
  },
  resumeText: {
    type: String
  },
  resumeVersions: [
    {
      resumePath: String,
      resumeText: String,
      extractedSkills: [String],
      source: {
        type: String,
        enum: ["upload", "builder"],
        default: "upload"
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  resumeBuilder: {
    fullName: String,
    title: String,
    summary: String,
    experience: [String],
    education: [String],
    projects: [String],
    certifications: [String]
  },
  skills: {
    type: [String]
  },

  // 👤 Personal Info
  headline: String,
  bio: String,
  dateOfBirth: Date,
  gender: String,

  // 📞 Contact Info
  phone: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  location: String,
  willingToRelocate: Boolean,
  linkedin: String,
  github: String,
  portfolio: String,
  codingProfiles: {
    leetcode: String,
    codeforces: String,
    hackerrank: String
  },

  // 🎓 Academic Info
  university: String,
  degree: String,
  specialization: String,
  academicStart: Date,
  academicEnd: Date,
  cgpa: Number,
  coursework: [String],

  // 💻 Technical Skills (Categorized)
  programmingLanguages: [String],
  frameworks: [String],
  databases: [String],
  tools: [String],
  softSkills: [String],
  languages: [
    {
      name: String,
      level: String
    }
  ],

  // 💼 Internships
  internships: [
    {
      organization: String,
      title: String,
      location: String,
      startDate: Date,
      endDate: Date,
      description: String
    }
  ],

  // 🚀 Projects
  projects: [
    {
      name: String,
      role: String,
      techStack: [String],
      repoLink: String,
      liveLink: String,
      description: String
    }
  ],

  // 🏆 Certifications & Achievements
  certifications: [
    {
      name: String,
      organization: String,
      issueDate: Date,
      credentialUrl: String
    }
  ],
  achievements: [String],

  // 🎯 Preferences
  jobInterests: [String],
  jobType: {
    type: String,
    enum: ["Full-time", "Internship", "Part-time"]
  }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
