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

dotenv.config();
const app = express();

// Trust proxy when hosted behind a proxy (Heroku, Vercel, etc.)
app.set("trust proxy", true);

// ----- PATH SETUP -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists (important on fresh deploys)
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("Created uploads directory:", uploadsPath);
  }
} catch (err) {
  console.warn("Could not create uploads directory:", err.message);
}

// ----- SECURITY & BODY -----
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ✅ ✅ ✅ FINAL CORS (FIXED FOR VERCEL + LOCAL + MOBILE)
// Build allowed origins from env or fallback to common dev/prod hosts
const allowedOrigins = (process.env.FRONTEND_URLS || "").split(",").map(s => s.trim()).filter(Boolean);
if (allowedOrigins.length === 0) {
  allowedOrigins.push("http://localhost:5173", "https://a5-x-indfrontend.vercel.app");
}

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://a5-x-indfrontend.vercel.app",
  ],
  credentials: false,   // ✅ MUST BE FALSE
}));




// ----- IMAGE STATIC ACCESS FIX -----

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsPath)
);

// ----- HEALTH CHECK -----
app.get("/api/ping", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ----- API ROUTES -----
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/gallery", galleryRoutes);

// Serve frontend build when in production (optional)
if (process.env.NODE_ENV === "production") {
  const clientBuild = path.join(__dirname, "..", "..", "frontend", "dist");
  if (fs.existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
    app.get("*", (req, res) => res.sendFile(path.join(clientBuild, "index.html")));
    console.log("Serving client from:", clientBuild);
  }
}

// Basic error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.message ? err.message : err);
  res.status(err?.status || 500).json({ message: err?.message || "Server error" });
});

// ----- SERVER START -----
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log("✅ Server running on port", PORT);
    });

    // Handle port in use error
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error("Try one of these solutions:");
        console.error(`1. Set different port: PORT=5001 npm run dev`);
        console.error(`2. Kill process on port ${PORT}: lsof -ti:${PORT} | xargs kill -9`);
        process.exit(1);
      } else {
        throw err;
      }
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("Shutting down server...");
      server.close(() => {
        mongoose.disconnect().then(() => {
          console.log("Mongo disconnected. Bye.");
          process.exit(0);
        });
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message || error);
    process.exit(1);
  }
};

start();
