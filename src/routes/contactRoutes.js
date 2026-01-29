import express from "express";
import { sendContactMail } from "../controllers/contactController.js";

const router = express.Router();

router.post("/send", sendContactMail);

// ✅ Health check for email service
router.get("/health", (req, res) => {
  const mailConfigured = !!(
    process.env.MAIL_USER && 
    process.env.MAIL_PASS && 
    process.env.MAIL_TO
  );

  res.json({
    status: mailConfigured ? "✅ OK" : "❌ NOT CONFIGURED",
    mailUser: process.env.MAIL_USER ? "✅" : "❌",
    mailPass: process.env.MAIL_PASS ? "✅" : "❌",
    mailTo: process.env.MAIL_TO ? "✅" : "❌",
  });
});

export default router;
