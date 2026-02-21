const User = require("../models/user");
const Job = require("../models/job");
const Application = require("../models/application");
const Conversation = require("../models/conversation");
const Message = require("../models/message");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signAuthToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const getClientIp = (req) => {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.trim()) {
    return xff.split(",")[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || "unknown";
};

const addLoginActivity = async (user, req) => {
  user.loginActivity = user.loginActivity || [];
  user.loginActivity.unshift({
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "unknown",
    loggedInAt: new Date()
  });
  user.loginActivity = user.loginActivity.slice(0, 20);
  await user.save();
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, role } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required"
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    const normalizedEmail = email?.trim().toLowerCase() || undefined;
    const normalizedPhone = phone?.trim() || undefined;

    const existingUser = await User.findOne({
      $or: [
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role,
      emailVerified: Boolean(normalizedEmail)
    });

    const token = signAuthToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("REGISTER ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, phone, password, identifier } = req.body;

    let loginEmail = email;
    let loginPhone = phone;

    const normalizedIdentifier = identifier?.trim();
    if (normalizedIdentifier && !loginEmail && !loginPhone) {
      if (normalizedIdentifier.includes("@")) {
        loginEmail = normalizedIdentifier;
      } else {
        loginPhone = normalizedIdentifier;
      }
    }

    const normalizedEmail = loginEmail?.trim().toLowerCase() || undefined;
    const normalizedPhone = loginPhone?.trim() || undefined;

    if (!normalizedEmail && !normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required"
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    const user = await User.findOne({
      $or: [
        ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
        ...(normalizedPhone ? [{ phone: normalizedPhone }] : [])
      ]
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    await addLoginActivity(user, req);

    const token = signAuthToken(user);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ACCOUNT SETTINGS SNAPSHOT
exports.getAccountSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email phone role twoFactorEnabled emailVerified pendingEmail loginActivity createdAt"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch account settings" });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All password fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "New passwords do not match" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordChangedAt = new Date();
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    return res.json({ success: true, message: "Password changed successfully. Please login again." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

// REQUEST EMAIL UPDATE (VERIFICATION)
exports.requestEmailUpdate = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const normalizedEmail = newEmail?.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.email === normalizedEmail) {
      return res.status(400).json({ success: false, message: "This is already your current email" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already in use" });
    }

    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.pendingEmail = {
      email: normalizedEmail,
      verificationCode,
      expiresAt,
      requestedAt: new Date()
    };
    await user.save();

    const response = {
      success: true,
      message: "Verification code generated. Check your email service integration to send this code."
    };

    if (process.env.NODE_ENV !== "production") {
      response.devVerificationCode = verificationCode;
    }

    return res.json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to request email update" });
  }
};

// VERIFY EMAIL UPDATE
exports.verifyEmailUpdate = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Verification code is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const pendingEmail = user.pendingEmail;
    if (!pendingEmail?.email || !pendingEmail?.verificationCode || !pendingEmail?.expiresAt) {
      return res.status(400).json({ success: false, message: "No pending email change found" });
    }

    if (new Date(pendingEmail.expiresAt).getTime() < Date.now()) {
      user.pendingEmail = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: "Verification code expired. Request again." });
    }

    if (String(pendingEmail.verificationCode) !== String(code).trim()) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    user.email = pendingEmail.email;
    user.emailVerified = true;
    user.pendingEmail = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Email updated successfully",
      email: user.email
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to verify email update" });
  }
};

// LOGIN ACTIVITY
exports.getLoginActivity = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("loginActivity");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      data: (user.loginActivity || []).slice(0, 20)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch login activity" });
  }
};

// LOGOUT ALL DEVICES
exports.logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    return res.json({
      success: true,
      message: "Logged out from all devices"
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to logout from all devices" });
  }
};

// DELETE ACCOUNT
exports.deleteAccount = async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    if (confirmation !== "DELETE") {
      return res.status(400).json({ success: false, message: 'Type DELETE in confirmation field to continue' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Password is incorrect" });
    }

    const myJobs = await Job.find({ postedBy: user._id }).select("_id");
    const myJobIds = myJobs.map((job) => job._id);

    await Application.deleteMany({
      $or: [
        { student: user._id },
        ...(myJobIds.length > 0 ? [{ job: { $in: myJobIds } }] : [])
      ]
    });

    const myConversations = await Conversation.find({ participants: user._id }).select("_id");
    const myConversationIds = myConversations.map((conversation) => conversation._id);

    await Message.deleteMany({
      $or: [
        { sender: user._id },
        ...(myConversationIds.length > 0 ? [{ conversation: { $in: myConversationIds } }] : [])
      ]
    });

    await Conversation.deleteMany({
      $or: [
        { participants: user._id },
        ...(myJobIds.length > 0 ? [{ job: { $in: myJobIds } }] : [])
      ]
    });

    await Job.updateMany({ recruiters: user._id }, { $pull: { recruiters: user._id } });
    await Job.deleteMany({ postedBy: user._id });

    await User.deleteOne({ _id: user._id });

    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete account" });
  }
};
