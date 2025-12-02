import express from "express";
import TeamMember from "../models/TeamMember.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js"; // ✔ default import

const router = express.Router();

/**
 * PUBLIC — GET ALL MEMBERS
 */
router.get("/", async (req, res) => {
  try {
    const list = await TeamMember.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * ADMIN — ADD MEMBER
 */
router.post("/", protect, upload.single("photo"), async (req, res) => {
  try {
    const {
      name,
      designation,
      bio,
      linkedin,
      instagram,
      showOnHome,
    } = req.body;

    if (!name || !designation || !bio) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const member = await TeamMember.create({
      name,
      designation,
      bio,
      linkedin: linkedin || null,
      instagram: instagram || null,
      showOnHome: showOnHome === "true",
      photo: imageUrl,
      createdBy: req.user._id,
    });

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ADMIN — DELETE MEMBER
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member)
      return res.status(404).json({ message: "Team member not found" });

    await member.deleteOne();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
