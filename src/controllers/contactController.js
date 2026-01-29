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
  // Don't wait for email - send it in background
  (async () => {
    try {
      console.log("📧 Contact form received from:", user_email);

      /* ✅ SIMPLIFIED GMAIL CONFIG FOR RENDER */
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,  // Use TLS port
        secure: false,  // Use TLS instead of SSL
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        connectionTimeout: 20000,
        socketTimeout: 20000,
      });

      /* =====================
         SEND ADMIN EMAIL
      ====================== */
      console.log("📤 Sending admin email...");
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: process.env.MAIL_TO,
        subject: `New Inquiry: ${user_name}`,
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
      });
      console.log("✅ Admin email sent");

      /* =====================
         SEND AUTO-REPLY
      ====================== */
      console.log("📤 Sending auto-reply...");
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user_email,
        subject: "We received your enquiry ✅",
        text: `
Hello ${user_name},

Thank you for contacting A5X Industries!

We have received your message and our team will respond within 24-48 hours.

Best regards,
A5X Industries Team
https://a5x.in
        `,
      });
      console.log("✅ Auto-reply sent");
      console.log("✅ All emails sent successfully!");

    } catch (err) {
      console.error("❌ Email Error:", err.message);
      console.error("   Code:", err.code);
    }
  })();
};
