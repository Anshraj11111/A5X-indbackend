// import nodemailer from "nodemailer";

// export const sendContactMail = async (req, res) => {
//   try {
//     const {
//       user_name,
//       user_email,
//       user_phone,
//       organization,
//       project_type,
//       budget,
//       message,
//     } = req.body;

//     // ✅ Required fields
//     if (!user_name || !user_email || !user_phone || !message) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, Email, Phone and Message are required!",
//       });
//     }

//     // ✅ Gmail transporter (App Password)
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.MAIL_USER, // sender
//         pass: process.env.MAIL_PASS,
//       },
//     });

//     // ✅ 1) ADMIN EMAIL (to you)
//     await transporter.sendMail({
//       from: `"A5X Industries" <${process.env.MAIL_USER}>`,
//       to: process.env.MAIL_TO,
//       subject: "New Contact Form Submission ✅",
//       html: `
//         <h2>New Website Enquiry 🚀</h2>
//         <p><b>Name:</b> ${user_name}</p>
//         <p><b>Email:</b> ${user_email}</p>
//         <p><b>Phone:</b> ${user_phone}</p>
//         <p><b>Organisation:</b> ${organization || "N/A"}</p>
//         <p><b>Project Type:</b> ${project_type || "N/A"}</p>
//         <p><b>Budget:</b> ${budget || "N/A"}</p>
//         <p><b>Message:</b><br/>${message}</p>
//       `,
//     });

//     // ✅ 2) AUTO-REPLY EMAIL (to user)
//     await transporter.sendMail({
//       from: `"A5X Industries" <${process.env.MAIL_USER}>`,
//       to: user_email,
//       subject: "Thanks for contacting A5X Industries ✅",
//       html: `
//         <h2>Hello ${user_name} 👋</h2>
//         <p>Thank you for contacting <b>A5X Industries</b>.</p>
//         <p>We have received your enquiry and our team will reply within <b>24–48 hours</b>.</p>

//         <hr/>

//         <p><b>Your Submitted Details:</b></p>
//         <p><b>Phone:</b> ${user_phone}</p>
//         <p><b>Organisation:</b> ${organization || "N/A"}</p>
//         <p><b>Project Type:</b> ${project_type || "N/A"}</p>
//         <p><b>Budget:</b> ${budget || "N/A"}</p>
//         <p><b>Message:</b><br/>${message}</p>

//         <br/>
//         <p>Regards,<br/><b>A5X Industries Team</b></p>
//       `,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Enquiry sent successfully",
//     });
//   } catch (error) {
//     console.log("Contact Email Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Email not sent ❌",
//       error: error.message,
//     });
//   }
// };
import nodemailer from "nodemailer";

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

  /* =====================
     BASIC VALIDATION
  ====================== */
  if (!user_name || !user_email || !user_phone || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, Email, Phone and Message are required!",
    });
  }

  /* ✅ CHECK ENV VARIABLES */
  console.log("📧 Contact form submission received");
  console.log("   MAIL_USER:", process.env.MAIL_USER ? "✅" : "❌");
  console.log("   MAIL_PASS:", process.env.MAIL_PASS ? "✅" : "❌");
  console.log("   MAIL_TO:", process.env.MAIL_TO ? "✅" : "❌");

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_TO) {
    console.error("❌ Email variables not configured!");
    return res.status(500).json({
      success: false,
      message: "Email service not configured.",
    });
  }

  try {
    /* ✅ GMAIL TRANSPORTER (OPTIMIZED FOR RENDER) */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      // 🔥 RENDER OPTIMIZATION
      connectionTimeout: 30000,  // 30 seconds
      socketTimeout: 30000,      // 30 seconds
      pool: {
        maxConnections: 1,
        maxMessages: 5,
        rateDelta: 2000,          // Wait 2s between messages
        rateLimit: 5,
      },
      tls: {
        rejectUnauthorized: false,
      },
      // Skip verification - it causes extra delay
      verify: false,
    });

    console.log("🔌 Preparing to send emails...");

    /* =====================
       SEND ADMIN EMAIL
    ====================== */
    console.log("📤 Sending admin email to:", process.env.MAIL_TO);
    
    const adminPromise = transporter.sendMail({
      from: `"A5X Industries" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: `🚀 New Inquiry: ${user_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0ff;">New Contact Form 🚀</h2>
          <p><b>Name:</b> ${user_name}</p>
          <p><b>Email:</b> ${user_email}</p>
          <p><b>Phone:</b> ${user_phone}</p>
          <p><b>Company:</b> ${organization || "N/A"}</p>
          <p><b>Project:</b> ${project_type || "N/A"}</p>
          <p><b>Budget:</b> ${budget || "N/A"}</p>
          <h3>Message:</h3>
          <p>${message.replace(/\n/g, "<br>")}</p>
        </div>
      `,
    });

    /* =====================
       SEND USER AUTO-REPLY
    ====================== */
    console.log("📤 Sending auto-reply to:", user_email);
    
    const userPromise = transporter.sendMail({
      from: `"A5X Industries" <${process.env.MAIL_USER}>`,
      to: user_email,
      subject: "Thank you for contacting A5X Industries ✅",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0ff;">Thank You! 👋</h2>
          <p>Hello ${user_name},</p>
          <p>Thank you for contacting <b>A5X Industries</b>!</p>
          <p style="background: #e8f8f7; padding: 15px; border-radius: 5px;">
            ✅ We have received your message. Our team will respond within <b>24-48 hours</b>.
          </p>
          <p>Best regards,<br><b>A5X Industries</b></p>
        </div>
      `,
    });

    /* =====================
       WAIT FOR BOTH EMAILS
    ====================== */
    const results = await Promise.all([adminPromise, userPromise]);
    console.log("✅ All emails sent successfully!");
    console.log("   Admin email ID:", results[0].messageId);
    console.log("   User email ID:", results[1].messageId);

    return res.status(200).json({
      success: true,
      message: "✅ Your enquiry has been submitted! We will respond within 24-48 hours.",
    });

  } catch (error) {
    console.error("❌ EMAIL ERROR:");
    console.error("   Message:", error.message);
    console.error("   Code:", error.code);
    
    // Log but don't expose full error to client
    return res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again.",
    });
  }
};
