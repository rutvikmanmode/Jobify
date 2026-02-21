const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config();

const app = express();
const normalizeOrigin = (value = "") => String(value).trim().replace(/\/+$/, "");
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((value) => normalizeOrigin(value))
  .filter(Boolean);
const corsDebug = String(process.env.CORS_DEBUG || "").toLowerCase() === "true";

const defaultAllowedPatterns = [
  /^https?:\/\/localhost(?::\d+)?$/i,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i
];

const isAllowedOrigin = (origin = "") => {
  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) return true;
  if (allowedOrigins.length === 0) return true;
  if (allowedOrigins.includes("*")) return true;

  if (allowedOrigins.includes(normalizedOrigin)) return true;
  if (defaultAllowedPatterns.some((pattern) => pattern.test(normalizedOrigin))) return true;

  // Allow Vercel preview/prod domains when configured as wildcard in CLIENT_URL.
  // Example: CLIENT_URL=https://*.vercel.app
  const hasVercelWildcard = allowedOrigins.includes("https://*.vercel.app");
  if (hasVercelWildcard && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(normalizedOrigin)) {
    return true;
  }

  return false;
};

// Connect Database
connectDB();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = isAllowedOrigin(origin);
      if (corsDebug) {
        console.log("[CORS]", { origin, allowed, allowedOrigins });
      }
      if (allowed) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());

// ✅ Serve uploaded files (resume + profile photos)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Routes
app.use("/api/auth", require("./routes/authroutes"));
app.use("/api/profile", require("./routes/profileroutes"));
app.use("/api/resume", require("./routes/resumeroutes"));
app.use("/api/jobs", require("./routes/jobroutes"));
app.use("/api/applications", require("./routes/applicationroutes"));
app.use("/api/analytics", require("./routes/analyticsroutes"));
app.use("/api/messages", require("./routes/messageroutes"));

// Root Route
app.get("/", (req, res) => {
  res.send("API running...");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
