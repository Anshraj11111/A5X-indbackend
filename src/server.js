import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";

dotenv.config();
const app = express();

// Path base
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "..", "uploads");

// ----------- IMPORTANT MIDDLEWARE --------------
app.use(helmet());
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true,
}));

// ---- CORS FIX FOR IMAGES ----
app.use("/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(uploadsPath)
);

// ---------------- API ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/gallery", galleryRoutes);

// ---------------- START DB & SERVER ----------
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected 🚀");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log("Server running @", PORT));
  } catch (e) {
    console.error(e);
  }
};

start();
