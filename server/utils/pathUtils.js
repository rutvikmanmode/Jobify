const path = require("path");

const toPosixPath = (value = "") => String(value).replace(/\\/g, "/");

const normalizeUploadPath = (value = "") => {
  const raw = toPosixPath(String(value || "").trim());
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const uploadsIndex = raw.toLowerCase().lastIndexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return raw.slice(uploadsIndex + 1);
  }

  const bareUploadsIndex = raw.toLowerCase().indexOf("uploads/");
  if (bareUploadsIndex >= 0) {
    return raw.slice(bareUploadsIndex);
  }

  return toPosixPath(path.posix.join("uploads", path.basename(raw)));
};

module.exports = {
  normalizeUploadPath,
  toPosixPath
};
