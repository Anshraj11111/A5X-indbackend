// import express from "express";
// import GalleryItem from "../models/GalleryItem.js";
// import { protect } from "../middleware/auth.js";
// import upload from "../middleware/upload.js";

// const router = express.Router();

// /* =====================
//    GET ALL GALLERY ITEMS
// ===================== */
// router.get("/", async (req, res) => {
//   try {
//     const items = await GalleryItem.find().sort({ createdAt: -1 });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// /* =====================
//    ADD GALLERY ITEM
// ===================== */
// router.post(
//   "/",
//   protect,
//   upload.single("file"), // 👈 frontend se "file" naam se aayega
//   async (req, res) => {
//     try {
//       if (!req.file || !req.file.path) {
//         return res.status(400).json({ message: "Image upload failed" });
//       }

//       const item = await GalleryItem.create({
//         fileType: "image",
//         url: req.file.path, // 👈 CLOUDINARY URL
//         title: req.body.title,
//         description: req.body.description,
//         createdBy: req.user._id,
//       });

//       res.json(item);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   }
// );

// /* =====================
//    DELETE GALLERY ITEM
// ===================== */
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     await GalleryItem.findByIdAndDelete(req.params.id);
//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;
// routes/galleryRoutes.js
import express from "express";
import GalleryItem from "../models/GalleryItem.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  res.json(items);
});

router.post(
  "/",
  protect,
  upload.single("file"), // 👈 FILE YAHI AAYEGI
  async (req, res) => {
    try {
      console.log("📤 UPLOAD REQUEST RECEIVED");
      console.log("User:", req.user?._id);
      console.log("File:", req.file ? `✅ ${req.file.filename}` : "❌ NO FILE");
      console.log("Body:", req.body);

      if (!req.file) {
        return res.status(400).json({ 
          message: "No image uploaded",
          received: req.body 
        });
      }

      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      console.log("🔄 Creating gallery item with URL:", req.file.path);

      const item = await GalleryItem.create({
        fileType: "image",
        url: req.file.path, // 👈 Cloudinary URL
        title: req.body.title || "Untitled",
        description: req.body.description || "",
        createdBy: req.user._id,
      });

      console.log("✅ Gallery item created:", item._id);
      res.json(item);
    } catch (err) {
      console.error("❌ GALLERY ERROR:", err.message);
      console.error("Full error:", err);
      res.status(500).json({ 
        message: "Gallery upload failed",
        error: err.message,
        details: process.env.NODE_ENV === "development" ? err : undefined
      });
    }
  }
);

router.delete("/:id", protect, async (req, res) => {
  try {
    console.log("🗑️ DELETE REQUEST");
    console.log("   User ID:", req.user?._id);
    console.log("   Item ID:", req.params.id);

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: "Image not found" });
    }

    console.log("✅ Image deleted:", item._id);
    res.json({ message: "✅ Image deleted successfully", deletedId: item._id });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err.message);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

export default router;
