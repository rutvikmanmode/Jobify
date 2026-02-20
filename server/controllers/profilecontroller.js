const User = require("../models/user");
const Job = require("../models/job");
const path = require("path");
const fs = require("fs");

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

const isRecruiterVerified = (user) => {
  const rp = user?.recruiterProfile || {};
  return Boolean(hasCorporateEmail(rp.workEmail) || rp.linkedinProfileUrl);
};

// ✅ Get My Profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const data = user.toObject();
    if (data.role === "recruiter") {
      data.recruiterVerified = isRecruiterVerified(data);
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ✅ Update Profile Info
exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

// ✅ Upload Profile Photo
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Optional: delete old photo if exists
    const user = await User.findById(req.user.id);
    if (user.profilePhoto) {
      try {
        const oldPhotoPath = path.isAbsolute(user.profilePhoto)
          ? user.profilePhoto
          : path.join(__dirname, "..", user.profilePhoto);
        fs.unlinkSync(oldPhotoPath);
      } catch {}
    }

    await User.findByIdAndUpdate(req.user.id, {
      profilePhoto: `uploads/${req.file.filename}`
    });

    res.json({
      success: true,
      message: "Photo uploaded successfully",
      photo: `uploads/${req.file.filename}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Photo upload failed"
    });
  }
};

// Public recruiter profile for students
exports.getRecruiterPublicProfile = async (req, res) => {
  try {
    const recruiter = await User.findById(req.params.id).select(
      "name email role recruiterProfile"
    );

    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(404).json({
        success: false,
        message: "Recruiter not found"
      });
    }

    const jobs = await Job.find({ postedBy: recruiter._id })
      .select("title company createdAt")
      .sort({ createdAt: -1 });

    const rp = recruiter.recruiterProfile || {};
    return res.json({
      success: true,
      data: {
        _id: recruiter._id,
        name: recruiter.name,
        recruiterVerified: isRecruiterVerified(recruiter),
        profile: {
          jobTitle: rp.jobTitle || "",
          professionalBio: rp.professionalBio || "",
          linkedinProfileUrl: rp.linkedinProfileUrl || "",
          profilePictureUrl: rp.profilePictureUrl || "",
          companyName: rp.companyName || "",
          companyLogoUrl: rp.companyLogoUrl || "",
          companyIndustry: rp.companyIndustry || "",
          companyWebsite: rp.companyWebsite || "",
          companySize: rp.companySize || "",
          officeLocation: rp.officeLocation || "",
          workEmail: rp.workEmail || "",
          workPhoneNumber: rp.workPhoneNumber || "",
          preferredCommunicationMethod: rp.preferredCommunicationMethod || "",
          availabilityResponseTime: rp.availabilityResponseTime || "",
          hiringDomains: rp.hiringDomains || [],
          seniorityLevels: rp.seniorityLevels || []
        },
        activeJobPostings: jobs
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recruiter profile"
    });
  }
};
