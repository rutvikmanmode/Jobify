const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
require("dotenv").config();

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

// Connect Database
connectDB();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    }
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
