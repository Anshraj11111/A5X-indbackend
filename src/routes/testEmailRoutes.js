import express from "express";
import { sendTestEmail } from "../controllers/testEmailController.js";

const router = express.Router();

// Public in dev only — call to test SMTP settings quickly
router.get("/", sendTestEmail);

export default router;
