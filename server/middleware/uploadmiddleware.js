const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadRoot = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadRoot, { recursive: true });

// Shared storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// PDF-only filter for resume uploads
const resumeFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

// Image-only filter for profile photos
const photoFileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const resumeUpload = multer({
  storage,
  fileFilter: resumeFileFilter
});

const photoUpload = multer({
  storage,
  fileFilter: photoFileFilter
});

// Chat file upload storage (documents/images)
const chatStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const chatDir = path.join(uploadRoot, "chat");
    fs.mkdirSync(chatDir, { recursive: true });
    cb(null, chatDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const chatFileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "text/plain"
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const chatUpload = multer({
  storage: chatStorage,
  fileFilter: chatFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

module.exports = {
  resumeUpload,
  photoUpload,
  chatUpload
};
