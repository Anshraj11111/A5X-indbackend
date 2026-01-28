import express from "express";
import GalleryItem from "../models/GalleryItem.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* =====================
   GET ALL GALLERY ITEMS
===================== */
router.get("/", async (req, res) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================
   ADD GALLERY ITEM
===================== */
router.post(
  "/",
  protect,
  upload.single("file"), // 👈 frontend se "file" naam se aayega
  async (req, res) => {
    try {
      if (!req.file || !req.file.path) {
        return res.status(400).json({ message: "Image upload failed" });
      }

      const item = await GalleryItem.create({
        fileType: "image",
        url: req.file.path, // 👈 CLOUDINARY URL
        title: req.body.title,
        description: req.body.description,
        createdBy: req.user._id,
      });

      res.json(item);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/* =====================
   DELETE GALLERY ITEM
===================== */
router.delete("/:id", protect, async (req, res) => {
  try {
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
