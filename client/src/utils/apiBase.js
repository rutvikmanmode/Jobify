const FALLBACK_API_BASE_URL = "http://localhost:5000/api";

const stripTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const ensureApiSuffix = (value = "") => {
  if (!value) return FALLBACK_API_BASE_URL;
  const normalized = stripTrailingSlash(value);
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const API_BASE_URL = ensureApiSuffix(import.meta.env.VITE_API_BASE_URL);
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

const normalizeAssetPath = (assetPath = "") => {
  const raw = String(assetPath || "").trim().replace(/\\/g, "/");
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  const uploadsMarkerIndex = raw.toLowerCase().lastIndexOf("/uploads/");
  if (uploadsMarkerIndex >= 0) {
    return raw.slice(uploadsMarkerIndex + 1);
  }

  const bareUploadsIndex = raw.toLowerCase().indexOf("uploads/");
  if (bareUploadsIndex >= 0) {
    return raw.slice(bareUploadsIndex);
  }

  return raw.replace(/^\/+/, "");
};

export const toServerAssetUrl = (assetPath = "") => {
  const normalized = normalizeAssetPath(assetPath);
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `${SERVER_BASE_URL}/${encodeURI(normalized)}`;
};

export const getResumeStreamUrl = (filename = "") => {
  if (!filename) return null;
  return `${API_BASE_URL}/resume/stream/${filename}`;
};
