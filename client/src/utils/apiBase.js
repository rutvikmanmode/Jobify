const FALLBACK_API_BASE_URL = "http://localhost:5000/api";

const stripTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const ensureApiSuffix = (value = "") => {
  if (!value) return FALLBACK_API_BASE_URL;
  const normalized = stripTrailingSlash(value);
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

export const API_BASE_URL = ensureApiSuffix(import.meta.env.VITE_API_BASE_URL);
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

export const toServerAssetUrl = (assetPath = "") => {
  if (!assetPath) return "";
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${SERVER_BASE_URL}/${String(assetPath).replace(/^\/+/, "")}`;
};

export const getResumeStreamUrl = (filename = "") => {
  if (!filename) return null;
  return `${API_BASE_URL}/resume/stream/${filename}`;
};
