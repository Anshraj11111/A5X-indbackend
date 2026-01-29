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
  console.log("   MAIL_USER configured:", !!process.env.MAIL_USER);
  console.log("   MAIL_PASS configured:", !!process.env.MAIL_PASS);
  console.log("   MAIL_TO configured:", !!process.env.MAIL_TO);

  if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_TO) {
    console.error("❌ Email variables not configured on server!");
    return res.status(500).json({
      success: false,
      message: "Email service not available. Please try again later.",
    });
  }

  /* =====================
     SEND EMAILS (WITH AWAIT)
  ====================== */
  try {
    /* ✅ GMAIL TRANSPORTER */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    /* ✅ TEST CONNECTION */
    await transporter.verify();
    console.log("✅ Gmail SMTP connection verified");

    /* =====================
       SEND ADMIN EMAIL
    ====================== */
    const adminResult = await transporter.sendMail({
      from: `"A5X Industries" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,
      subject: `🚀 New Contact Form Enquiry from ${user_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0ff; border-bottom: 2px solid #0ff; padding-bottom: 10px;">New Website Enquiry 🚀</h2>
          <table style="width: 100%; margin: 15px 0;">
            <tr style="background: white;">
              <td style="padding: 10px; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 10px;">${user_name}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold;">Email:</td>
              <td style="padding: 10px;"><a href="mailto:${user_email}">${user_email}</a></td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 10px; font-weight: bold;">Phone:</td>
              <td style="padding: 10px;"><a href="tel:${user_phone}">${user_phone}</a></td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold;">Organisation:</td>
              <td style="padding: 10px;">${organization || "N/A"}</td>
            </tr>
            <tr style="background: white;">
              <td style="padding: 10px; font-weight: bold;">Project Type:</td>
              <td style="padding: 10px;">${project_type || "N/A"}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 10px; font-weight: bold;">Budget:</td>
              <td style="padding: 10px;">${budget || "N/A"}</td>
            </tr>
          </table>
          <div style="background: white; padding: 15px; border-left: 4px solid #0ff; margin-top: 20px;">
            <h4 style="margin-top: 0; color: #333;">Message:</h4>
            <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            This email was sent from a5x.in contact form
          </p>
        </div>
      `,
    });
    console.log("✅ Admin email sent successfully:", adminResult.messageId);

    /* =====================
       SEND USER AUTO-REPLY
    ====================== */
    const userResult = await transporter.sendMail({
      from: `"A5X Industries" <${process.env.MAIL_USER}>`,
      to: user_email,
      subject: "We received your enquiry ✅ - A5X Industries",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <h2 style="color: #0ff; text-align: center;">Thank You! 👋</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Hello <strong>${user_name}</strong>,</p>
            
            <p>Thank you for contacting <strong>A5X Industries</strong>!</p>
            
            <p style="background: #e8f8f7; padding: 15px; border-radius: 5px; border-left: 4px solid #0ff;">
              ✅ We have received your enquiry and our team will review it shortly. We will respond within <strong>24–48 hours</strong>.
            </p>

            <h4 style="color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Your Submitted Information:</h4>
            <table style="width: 100%; margin: 15px 0;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 150px;">Phone:</td>
                <td style="padding: 8px;">${user_phone}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 8px; font-weight: bold;">Organisation:</td>
                <td style="padding: 8px;">${organization || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Project Type:</td>
                <td style="padding: 8px;">${project_type || "N/A"}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 8px; font-weight: bold;">Budget:</td>
                <td style="padding: 8px;">${budget || "N/A"}</td>
              </tr>
            </table>
          </div>

          <p style="color: #666; line-height: 1.6;">
            In the meantime, feel free to check our website at <a href="https://a5x.in" style="color: #0ff;">a5x.in</a> to learn more about our services.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="color: #999; font-size: 13px;">
            Best regards,<br>
            <strong>A5X Industries Team</strong><br>
            <a href="https://a5x.in" style="color: #0ff; text-decoration: none;">a5x.in</a>
          </p>
        </div>
      `,
    });
    console.log("✅ User auto-reply sent successfully:", userResult.messageId);

    /* =====================
       SEND SUCCESS RESPONSE
    ====================== */
    return res.status(200).json({
      success: true,
      message: "✅ Your enquiry has been submitted successfully! We will respond within 24-48 hours.",
    });

  } catch (error) {
    console.error("❌ CRITICAL EMAIL ERROR:");
    console.error("   Error Message:", error.message);
    console.error("   Error Code:", error.code);
    console.error("   Error Response:", error.response);
    console.error("   Full Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send enquiry. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
