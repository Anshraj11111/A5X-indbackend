import express from "express";
import {
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
} from "../controllers/adminContactController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Admin routes (protected)
router.get("/", protect, getAllContacts);
router.get("/stats", protect, getContactStats);
router.get("/:id", protect, getContactById);
router.put("/:id/status", protect, updateContactStatus);
router.delete("/:id", protect, deleteContact);

export default router;
