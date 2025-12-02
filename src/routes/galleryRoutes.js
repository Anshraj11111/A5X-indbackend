import express from "express";
import GalleryItem from "../models/GalleryItem.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET all gallery
router.get("/", async (req, res) => {
  const items = await GalleryItem.find().sort({ createdAt: -1 });
  res.json(items);
});


// ADD gallery item AFTER upload
router.post("/", protect, async (req, res) => {
  try {
    const { fileType, url, title, description } = req.body;

    if (!url) return res.status(400).json({ message: "Missing URL" });

    const item = await GalleryItem.create({
      fileType: fileType || "image",
      url,
      title,
      description,
      createdBy: req.user._id,
    });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE
router.delete("/:id", protect, async (req, res) => {
  try {
    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
