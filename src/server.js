import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";

dotenv.config();
const app = express();

// ----- PATH SETUP -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "..", "uploads");

// ----- SECURITY & BODY -----
app.use(helmet());
app.use(express.json());

// ✅ ✅ ✅ FINAL CORS (FIXED FOR VERCEL + LOCAL + MOBILE)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://a5-x-indfrontend.vercel.app",
    "https://a5-x-indfrontend-git-main-anshraj-baghels-projects.vercel.app",
    "https://a5-x-indfrontend-qow336yo5-anshraj-baghels-projects.vercel.app"
  ],
  credentials: false, // ✅ JWT use ho raha hai
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


// ----- API ROUTES -----
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/gallery", galleryRoutes);

// ----- SERVER START -----
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log("✅ Server running on port", PORT));
  } catch (error) {
    console.error("❌ DB Connection Error:", error);
  }
};

start();
