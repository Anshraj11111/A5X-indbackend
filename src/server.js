

import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import compression from "compression";
import morgan from "morgan";

// Routes
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import adminContactRoutes from "./routes/adminContactRoutes.js";
import testEmailRoutes from "./routes/testEmailRoutes.js";
import { configureCloudinary } from "./utils/cloudinary.js";

// ✅ Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, "..", ".env");
console.log("📝 Loading .env from:", envPath);
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error("❌ Error loading .env:", envResult.error.message);
} else {
  console.log("✅ .env loaded successfully");
  console.log("   Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "✅" : "❌");
  console.log("   Cloudinary API Key:", process.env.CLOUDINARY_API_KEY ? "✅" : "❌");
}

// ✅ NOW configure Cloudinary after .env is loaded
configureCloudinary();

const app = express();

// Trust proxy (important for Render)
app.set("trust proxy", true);

/* ======================
   PATH SETUP
====================== */
const uploadsPath = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

/* ======================
   MIDDLEWARES
====================== */
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/* ======================
   ✅ CORS (FINAL + WORKING)
====================== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174", // Vite dev server
  "http://localhost:3000",

  "https://a5xorignal.vercel.app",

  "https://a5x.in",
  "https://www.a5x.in",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // keep false because you're not using cookies
};

app.use(cors(corsOptions));

// ✅ handle preflight properly (IMPORTANT FIX)
app.options("*", cors(corsOptions));

/* ======================
   STATIC UPLOADS
====================== */
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsPath)
);

/* ======================
   HEALTH CHECK
====================== */
app.get("/api/ping", (req, res) => {
  res.json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ======================
   ROUTES
====================== */
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contact",contactRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin/contacts", adminContactRoutes);
app.use("/api/test-email", testEmailRoutes);

/* ======================
   ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message || err);
  res.status(500).json({ message: err.message || "Server error" });
});

/* ======================
   SERVER START
====================== */
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1);
  }
};

start();
