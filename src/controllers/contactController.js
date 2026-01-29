import nodemailer from "nodemailer";

// contactController - prefers SendGrid API when SENDGRID_API_KEY is set,
// otherwise falls back to SMTP (Gmail). Responds immediately and sends
// emails in the background with robust logging.
export const sendContactMail = async (req, res) => {
  const {
    user_name,
    user_email,
    user_phone,
    organization,
    project_type,
    budget,
    message,
  } = req.body;

  if (!user_name || !user_email || !user_phone || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  if (!process.env.MAIL_TO) {
    console.error("❌ MAIL_TO not configured");
    return res.status(500).json({ success: false, message: "Email recipient not configured" });
  }

  // Immediate response
  res.status(200).json({ success: true, message: "Enquiry received" });

  // Send in background
  (async () => {
    try {
      console.log("📧 Contact form received:", user_email, "-", user_name);

      // Use SendGrid API if configured (recommended on cloud hosts)
      if (process.env.SENDGRID_API_KEY) {
        console.log("🔁 Using SendGrid API to send emails");
        const sgMail = (await import("@sendgrid/mail")).default;
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const adminMsg = {
          to: process.env.MAIL_TO,
          from: process.env.MAIL_USER || process.env.MAIL_TO,
          subject: `New Inquiry: ${user_name}`,
          text: `Name: ${user_name}\nEmail: ${user_email}\nPhone: ${user_phone}\nCompany: ${organization || "N/A"}\nProject: ${project_type || "N/A"}\nBudget: ${budget || "N/A"}\n\nMessage:\n${message}`,
        };

        const userMsg = {
          to: user_email,
          from: process.env.MAIL_USER || process.env.MAIL_TO,
          subject: "Thanks for contacting A5X Industries",
          text: `Hello ${user_name},\n\nThanks for contacting A5X Industries. We received your enquiry and will reply within 24-48 hours.\n\nRegards, A5X Industries`,
        };

        await sgMail.send(adminMsg);
        await sgMail.send(userMsg);
        console.log("✅ SendGrid: emails sent successfully");
        return;
      }

      // Fallback to SMTP
      console.log("🔁 No SendGrid key found, falling back to SMTP (gmail)");
      const cleanPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.replace(/\s/g, "") : undefined;

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: cleanPass,
        },
        connectionTimeout: 30000,
        socketTimeout: 30000,
      });

      const adminResult = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: process.env.MAIL_TO,
        replyTo: user_email,
        subject: `New Inquiry: ${user_name}`,
        text: `Name: ${user_name}\nEmail: ${user_email}\nPhone: ${user_phone}\nCompany: ${organization || "N/A"}\nProject: ${project_type || "N/A"}\nBudget: ${budget || "N/A"}\n\nMessage:\n${message}`,
      });
      console.log("✅ SMTP admin email sent:", adminResult?.messageId || adminResult);

      const userResult = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user_email,
        subject: "Thanks for contacting A5X Industries",
        text: `Hello ${user_name},\n\nThanks for contacting A5X Industries. We received your enquiry and will reply within 24-48 hours.\n\nRegards, A5X Industries`,
      });
      console.log("✅ SMTP user email sent:", userResult?.messageId || userResult);

    } catch (err) {
      console.error("❌ EMAIL SEND ERROR:", err?.message || err);
      if (err?.code) console.error("   Code:", err.code);
      if (err?.response) console.error("   Response:", err.response);
    }
  })();
};
