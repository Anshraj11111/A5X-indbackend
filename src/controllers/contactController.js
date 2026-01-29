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
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_TO) {
    console.error("❌ Email variables missing!");
    return res.status(500).json({
      success: false,
      message: "Email service not configured.",
    });
  }

  // ✅ SEND RESPONSE IMMEDIATELY
  res.status(200).json({
    success: true,
    message: "✅ Your enquiry has been submitted! We will respond within 24-48 hours.",
  });

  /* =====================
     BACKGROUND EMAIL (ASYNC)
  ====================== */
  // Send email in background without blocking response
  (async () => {
    try {
      console.log("📧 Contact form received from:", user_email);
      console.log("   Name:", user_name);
      console.log("   Subject:", project_type || "General inquiry");

      // ✅ CLEAN UP APP PASSWORD - Remove spaces
      const cleanPassword = process.env.MAIL_PASS.replace(/\s/g, "");
      console.log("   Using Gmail with:", process.env.MAIL_USER);

      /* ✅ GMAIL CONFIG FOR RENDER */
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,  // Use STARTTLS
        auth: {
          user: process.env.MAIL_USER,
          pass: cleanPassword,  // Remove spaces from app password
        },
        logger: true,  // Enable logging
        debug: true,   // Enable debug
        connectionTimeout: 20000,
        socketTimeout: 20000,
        maxConnections: 1,
        maxMessages: 10,
      });

      /* =====================
         SEND ADMIN EMAIL
      ====================== */
      console.log("📤 Sending admin email to:", process.env.MAIL_TO);
      const adminResult = await transporter.sendMail({
        from: `"A5X Industries" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_TO,
        replyTo: user_email,
        subject: `New Inquiry from ${user_name}`,
        text: `
Name: ${user_name}
Email: ${user_email}
Phone: ${user_phone}
Company: ${organization || "N/A"}
Project: ${project_type || "N/A"}
Budget: ${budget || "N/A"}

Message:
${message}
        `,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>New Contact Form Submission</h2>
            <p><b>Name:</b> ${user_name}</p>
            <p><b>Email:</b> ${user_email}</p>
            <p><b>Phone:</b> ${user_phone}</p>
            <p><b>Company:</b> ${organization || "N/A"}</p>
            <p><b>Project Type:</b> ${project_type || "N/A"}</p>
            <p><b>Budget:</b> ${budget || "N/A"}</p>
            <h3>Message:</h3>
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
        `,
      });
      console.log("✅ Admin email sent with ID:", adminResult.messageId);

      /* =====================
         SEND AUTO-REPLY
      ====================== */
      console.log("📤 Sending auto-reply to:", user_email);
      const userResult = await transporter.sendMail({
        from: `"A5X Industries" <${process.env.MAIL_USER}>`,
        to: user_email,
        subject: "Thank you for contacting A5X Industries ✅",
        text: `
Hello ${user_name},

Thank you for contacting A5X Industries!

We have received your enquiry and our team will respond within 24-48 hours.

Best regards,
A5X Industries Team
https://a5x.in
        `,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #0ff;">Thank You! 👋</h2>
            <p>Hello <b>${user_name}</b>,</p>
            <p>Thank you for contacting <b>A5X Industries</b>!</p>
            <p style="background: #e8f8f7; padding: 15px; border-radius: 5px;">
              ✅ We have received your enquiry. Our team will respond within <b>24-48 hours</b>.
            </p>
            <p>Best regards,<br><b>A5X Industries Team</b><br><a href="https://a5x.in">a5x.in</a></p>
          </div>
        `,
      });
      console.log("✅ Auto-reply sent with ID:", userResult.messageId);
      console.log("✅ ===== ALL EMAILS SENT SUCCESSFULLY =====");

    } catch (err) {
      console.error("❌ EMAIL SENDING FAILED");
      console.error("   Error Message:", err.message);
      console.error("   Error Code:", err.code);
      console.error("   From:", process.env.MAIL_USER);
      console.error("   To:", process.env.MAIL_TO);
      if (err.response) {
        console.error("   SMTP Response:", err.response);
      }
    }
  })();
};
