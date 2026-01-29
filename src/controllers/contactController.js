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
    console.error("❌ MAIL ENV VARS MISSING:");
    console.error("   MAIL_USER:", process.env.MAIL_USER ? "✅" : "❌ MISSING");
    console.error("   MAIL_PASS:", process.env.MAIL_PASS ? "✅" : "❌ MISSING");
    console.error("   MAIL_TO:", process.env.MAIL_TO ? "✅" : "❌ MISSING");
    
    return res.status(500).json({
      success: false,
      message: "Mail service not configured. Please contact support.",
    });
  }

  /* =====================
     SEND RESPONSE FAST
  ====================== */
  res.status(200).json({
    success: true,
    message: "Enquiry submitted successfully ✅",
  });

  /* =====================
     BACKGROUND EMAIL
  ====================== */
  setImmediate(async () => {
    try {
      console.log("📩 Contact enquiry received");
      console.log("   From:", user_email);
      console.log("   Subject: " + (project_type || "General inquiry"));

      /* ✅ GMAIL TRANSPORTER */
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS, // Use app password as-is (with spaces if needed)
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      /* ✅ VERIFY SMTP CONNECTION */
      await transporter.verify();
      console.log("✅ Gmail SMTP verified");

      /* =====================
         ADMIN MAIL (to you)
      ====================== */
      await transporter.sendMail({
        from: `"A5X Industries" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_TO,
        subject: "🚀 New Contact Form Enquiry - A5X",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ff;">New Website Enquiry 🚀</h2>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
              <p><b>Name:</b> ${user_name}</p>
              <p><b>Email:</b> ${user_email}</p>
              <p><b>Phone:</b> ${user_phone}</p>
              <p><b>Organisation:</b> ${organization || "N/A"}</p>
              <p><b>Project Type:</b> ${project_type || "N/A"}</p>
              <p><b>Budget:</b> ${budget || "N/A"}</p>
              <p><b>Message:</b><br/>${message.replace(/\n/g, "<br/>")}</p>
            </div>
          </div>
        `,
      });
      console.log("✅ Admin email sent to:", process.env.MAIL_TO);

      /* =====================
         AUTO-REPLY MAIL (to user)
      ====================== */
      await transporter.sendMail({
        from: `"A5X Industries" <${process.env.MAIL_USER}>`,
        to: user_email,
        subject: "We received your enquiry ✅",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h3>Hello ${user_name} 👋</h3>
            <p>Thank you for contacting <b>A5X Industries</b>.</p>
            <p>We have received your enquiry and our team will respond within <b>24–48 hours</b>.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">
            <h4>Your Submitted Details:</h4>
            <ul>
              <li><b>Phone:</b> ${user_phone}</li>
              <li><b>Organisation:</b> ${organization || "N/A"}</li>
              <li><b>Project Type:</b> ${project_type || "N/A"}</li>
              <li><b>Budget:</b> ${budget || "N/A"}</li>
            </ul>
            <p><b>Message:</b><br/>${message.replace(/\n/g, "<br/>")}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">
            <p>Best regards,<br/><b>A5X Industries Team</b></p>
          </div>
        `,
      });
      console.log("✅ Auto-reply sent to:", user_email);
      console.log("✅ Both emails sent successfully!");

    } catch (err) {
      console.error("❌ Email Error:", err.message);
      console.error("   Error Code:", err.code);
      console.error("   Gmail Service:", process.env.MAIL_USER ? "Configured" : "Not configured");
    }
  });
};
