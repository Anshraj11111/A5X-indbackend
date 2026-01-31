import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

// ✅ Initialize SendGrid if API key exists
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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

      // Use SendGrid API if configured (recommended on cloud hosts like Render)
      if (process.env.SENDGRID_API_KEY) {
        console.log("🔁 Using SendGrid API to send emails");

        const adminMsg = {
          to: process.env.MAIL_TO,
          from: process.env.MAIL_USER || process.env.MAIL_TO,
          subject: `New Inquiry: ${user_name}`,
          html: `
            <h3>New Contact Form Inquiry</h3>
            <p><strong>Name:</strong> ${user_name}</p>
            <p><strong>Email:</strong> ${user_email}</p>
            <p><strong>Phone:</strong> ${user_phone}</p>
            <p><strong>Organization:</strong> ${organization || "N/A"}</p>
            <p><strong>Project Type:</strong> ${project_type || "N/A"}</p>
            <p><strong>Budget:</strong> ${budget || "N/A"}</p>
            <h4>Message:</h4>
            <p>${message.replace(/\n/g, "<br/>")}</p>
          `,
        };

        const userMsg = {
          to: user_email,
          from: process.env.MAIL_USER || process.env.MAIL_TO,
          subject: "Thanks for contacting A5X Industries ✅",
          html: `
            <h3>Hello ${user_name},</h3>
            <p>Thank you for contacting <strong>A5X Industries</strong>.</p>
            <p>We received your enquiry and will review it shortly. Our team will reply within <strong>24-48 hours</strong>.</p>
            <p>If your query is urgent, you can also reach us via phone.</p>
            <p style="margin-top: 20px;">Best regards,<br/><strong>A5X Industries Team</strong></p>
          `,
        };

        try {
          await sgMail.send(adminMsg);
          console.log("✅ SendGrid: Admin email sent successfully");
        } catch (adminErr) {
          console.error("❌ SendGrid: Failed to send admin email:", adminErr.message);
        }

        try {
          await sgMail.send(userMsg);
          console.log("✅ SendGrid: Auto-reply sent to user");
        } catch (userErr) {
          console.error("❌ SendGrid: Failed to send user email:", userErr.message);
        }

        return;
      }

      // Fallback to SMTP (Gmail/SMTP settings)
      console.log("🔁 No SendGrid key found, using SMTP (Gmail)");

      if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
        console.error("❌ MAIL_USER and MAIL_PASS not configured - neither SendGrid nor SMTP can send emails");
        return;
      }

      const cleanPass = process.env.MAIL_PASS.replace(/\s/g, "");

      const transporter = nodemailer.createTransport({
        service: "gmail",
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
        html: `
          <h3>New Contact Form Inquiry</h3>
          <p><strong>Name:</strong> ${user_name}</p>
          <p><strong>Email:</strong> ${user_email}</p>
          <p><strong>Phone:</strong> ${user_phone}</p>
          <p><strong>Organization:</strong> ${organization || "N/A"}</p>
          <p><strong>Project Type:</strong> ${project_type || "N/A"}</p>
          <p><strong>Budget:</strong> ${budget || "N/A"}</p>
          <h4>Message:</h4>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        `,
      });
      console.log("✅ SMTP admin email sent:", adminResult?.messageId);

      const userResult = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user_email,
        subject: "Thanks for contacting A5X Industries ✅",
        html: `
          <h3>Hello ${user_name},</h3>
          <p>Thank you for contacting <strong>A5X Industries</strong>.</p>
          <p>We received your enquiry and will review it shortly. Our team will reply within <strong>24-48 hours</strong>.</p>
          <p>If your query is urgent, you can also reach us via phone.</p>
          <p style="margin-top: 20px;">Best regards,<br/><strong>A5X Industries Team</strong></p>
        `,
      });
      console.log("✅ SMTP user email sent:", userResult?.messageId);

    } catch (err) {
      console.error("❌ EMAIL SEND ERROR:", err?.message || err);
      if (err?.code) console.error("   Code:", err.code);
      if (err?.response?.body) console.error("   Response:", err.response.body);
    }
  })();
};
