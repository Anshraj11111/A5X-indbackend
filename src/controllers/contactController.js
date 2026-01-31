import nodemailer from "nodemailer";

export const sendContactMail = async (req, res) => {
  try {
    const {
      user_name,
      user_email,
      user_phone,
      organization,
      project_type,
      budget,
      message,
    } = req.body;

    // ✅ Validation
    if (!user_name || !user_email || !user_phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ✅ Gmail SMTP (PRODUCTION SAFE)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT), // 587
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    /* ================= ADMIN EMAIL ================= */
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
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

    /* ================= USER AUTO-REPLY ================= */
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user_email,
      subject: "We received your enquiry – A5X Industries",
      html: `
        <p>Hello ${user_name},</p>

        <p>Thank you for contacting <b>A5X Industries</b>.</p>

        <p>
          We have received your enquiry and our team will respond within
          <b>24–48 hours</b>.
        </p>

        <p>
          Regards,<br/>
          <b>A5X Industries Team</b>
        </p>
      `,
    });

    // ✅ RESPONSE AFTER BOTH MAILS SUCCESS
    return res.json({
      success: true,
      message: "Enquiry submitted successfully",
    });

  } catch (err) {
    console.error("CONTACT MAIL ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Email sending failed",
    });
  }
};