process.env.DOTENVX_QUIET = "true";
process.env.DOTENV_CONFIG_QUIET = "true";
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const registrationRoutes = require("./routes/registrationRoutes");
const authRoutes = require("./routes/authRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const influencerRoutes = require("./routes/influencerRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const seedRoutes = require("./routes/seedRoutes");

const app = express();

// Security Headers & CORS Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development & client integration
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API Routes
app.use("/api/register", registrationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/influencers", influencerRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/seed", seedRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    message: "InfluenceAI production-ready backend operational",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    message: "InfluenceAI API services running smoothly",
    timestamp: new Date().toISOString()
  });
});

// 404 Not Found Fallback for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("Global Server Error:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error occurred"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});