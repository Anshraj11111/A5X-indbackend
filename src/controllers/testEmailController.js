import nodemailer from "nodemailer";

export const sendTestEmail = async (req, res) => {
  // simple test endpoint to check SMTP connectivity and sending
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_TO) {
      return res.status(500).json({ success: false, message: "SMTP not configured in .env" });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      logger: true,
      debug: true,
    });

    // verify
    try {
      await transporter.verify();
      console.log("✅ Test: transporter.verify() success");
    } catch (verifyErr) {
      console.error("❌ Test: transporter.verify() failed:", verifyErr);
      return res.status(500).json({ success: false, message: "SMTP verification failed", error: verifyErr.message });
    }

    // send a quick test mail to MAIL_TO
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.MAIL_TO,
      subject: "[Test] SMTP send from A5X backend",
      text: "This is a test message sent from backend test endpoint.",
    });

    console.log("✅ Test email sent:", info && (info.messageId || info.response));
    res.json({ success: true, message: "Test email sent", info });
  } catch (err) {
    console.error("❌ Test email failed:", err);
    res.status(500).json({ success: false, message: "Test email failed", error: err.message || err });
  }
};