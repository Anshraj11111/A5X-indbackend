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

    /* =====================
       VALIDATION
    ====================== */
    if (!user_name || !user_email || !user_phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, Phone and Message are required!",
      });
    }

    if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_TO) {
      return res.status(500).json({
        success: false,
        message: "Mail service not configured",
      });
    }

    /* =====================
       GMAIL TRANSPORT (SAFE)
    ====================== */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS.replace(/\s/g, ""),
      },
    });

    /* =====================
       ADMIN MAIL
    ====================== */
    await transporter.sendMail({
      from: `"A5X Website" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_TO,

      // 🔥 THIS LINE FIXES LIVE ISSUE
      replyTo: user_email,

      subject: "New Website Enquiry",
      html: `
        <h2>New Enquiry 🚀</h2>
        <p><b>Name:</b> ${user_name}</p>
        <p><b>Email:</b> ${user_email}</p>
        <p><b>Phone:</b> ${user_phone}</p>
        <p><b>Organisation:</b> ${organization || "N/A"}</p>
        <p><b>Project:</b> ${project_type || "N/A"}</p>
        <p><b>Budget:</b> ${budget || "N/A"}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
    });

    /* =====================
       AUTO REPLY (SHORT)
    ====================== */
    await transporter.sendMail({
      from: `"A5X Industries" <${process.env.MAIL_USER}>`,
      to: user_email,
      subject: "Thanks for contacting A5X Industries",
      html: `
        <p>Hello ${user_name},</p>
        <p>Thank you for contacting <b>A5X Industries</b>.</p>
        <p>We have received your enquiry and will reply within <b>24–48 hours</b>.</p>
        <br/>
        <p>Regards,<br/>A5X Industries Team</p>
      `,
    });

    /* =====================
       FINAL RESPONSE
    ====================== */
    return res.status(200).json({
      success: true,
      message: "Enquiry submitted successfully",
    });

  } catch (err) {
    console.error("❌ Contact Mail Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending mail",
    });
  }
};
