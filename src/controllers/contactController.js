import nodemailer from "nodemailer";
import Contact from "../models/Contact.js";

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
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  // 💾 SAVE TO DATABASE
  try {
    const newContact = new Contact({
      user_name,
      user_email,
      user_phone,
      organization,
      project_type,
      budget,
      message,
    });

    await newContact.save();
    console.log("✅ Contact saved to database:", newContact._id);
  } catch (dbErr) {
    console.error("❌ Database save failed:", dbErr.message);
  }

  // ✅ FRONTEND KO TURANT RESPONSE
  res.status(200).json({
    success: true,
    message: "Enquiry received",
  });

  // ============================
  // 🔥 BACKGROUND EMAIL SENDER
  // ============================
  
  // Validate environment variables
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_TO) {
    console.error("❌ Email config missing:", {
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      MAIL_TO: !!process.env.MAIL_TO,
    });
    return res.status(500).json({
      success: false,
      message: "Email service not configured",
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // TLS (port 587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 20000,
      logger: true, // Debug mode
      debug: true,
    });

    console.log("📧 Sending email from:", process.env.SMTP_USER);
    console.log("📧 Sending to admin:", process.env.MAIL_TO);

    // 🔹 Admin Mail
    await transporter.sendMail({
      from: process.env.SMTP_USER, // Use direct email instead of EMAIL_FROM
      to: process.env.MAIL_TO,
      replyTo: user_email,
      subject: `New Contact Enquiry – ${user_name}`,
      html: `
        <h3>New Contact Enquiry</h3>
        <p><b>Name:</b> ${user_name}</p>
        <p><b>Email:</b> ${user_email}</p>
        <p><b>Phone:</b> ${user_phone}</p>
        <p><b>Organization:</b> ${organization || "N/A"}</p>
        <p><b>Project Type:</b> ${project_type || "N/A"}</p>
        <p><b>Budget:</b> ${budget || "N/A"}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    console.log("✅ Admin email sent successfully");

    // 🔹 User Auto Reply
    await transporter.sendMail({
      from: process.env.SMTP_USER, // Use direct email instead of EMAIL_FROM
      to: user_email,
      subject: "We received your enquiry – A5X Industries",
      html: `
        <p>Hello ${user_name},</p>
        <p>Thank you for contacting <b>A5X Industries</b>.</p>
        <p>We have received your enquiry and will respond within <b>24–48 hours</b>.</p>
        <p>Regards,<br/><b>A5X Industries Team</b></p>
      `,
    });

    console.log("✅ User confirmation email sent successfully");
  } catch (err) {
    console.error("❌ Email send failed:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      response: err.response,
      command: err.command,
    });
  }
};