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

    // ✅ Required fields validation
    if (!user_name || !user_email || !user_phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, Phone and Message are required!",
      });
    }

    // ✅ ENV check (important)
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_TO) {
      return res.status(500).json({
        success: false,
        message: "Mail service not configured properly (ENV missing).",
      });
    }

    // ✅ Send response immediately (FAST ✅)
    res.status(200).json({
      success: true,
      message: "Enquiry submitted ✅",
    });

    // ✅ Background Mail Sending (NO BLOCKING ✅)
    setTimeout(async () => {
      try {
        console.log("📩 Contact Enquiry Received");
        console.log("➡️ ADMIN MAIL TO:", process.env.MAIL_TO);
        console.log("➡️ AUTO REPLY TO:", user_email);

        // ✅ Gmail App password spaces issue fix
        const MAIL_PASS = process.env.MAIL_PASS.replace(/\s/g, "");

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.MAIL_USER,
            pass: MAIL_PASS,
          },
          connectionTimeout: 15000,
          greetingTimeout: 15000,
          socketTimeout: 15000,
        });

        // ✅ Verify SMTP (debug easy)
        await transporter.verify();
        console.log("✅ SMTP Verified Successfully");

        // ✅ 1) ADMIN MAIL
        const adminMailOptions = {
          from: `"A5X Industries" <${process.env.MAIL_USER}>`,
          to: process.env.MAIL_TO,
          subject: "New Contact Form Submission ✅",
          html: `
            <h2>New Website Enquiry 🚀</h2>
            <p><b>Name:</b> ${user_name}</p>
            <p><b>Email:</b> ${user_email}</p>
            <p><b>Phone:</b> ${user_phone}</p>
            <p><b>Organisation:</b> ${organization || "N/A"}</p>
            <p><b>Project Type:</b> ${project_type || "N/A"}</p>
            <p><b>Budget:</b> ${budget || "N/A"}</p>
            <p><b>Message:</b><br/>${message}</p>
          `,
        };

        // ✅ 2) AUTO REPLY MAIL
        const userMailOptions = {
          from: `"A5X Industries" <${process.env.MAIL_USER}>`,
          to: user_email,
          subject: "Thanks for contacting A5X Industries ✅",
          html: `
            <h2>Hello ${user_name} 👋</h2>
            <p>Thank you for contacting <b>A5X Industries</b>.</p>
            <p>We have received your enquiry and our team will reply within <b>24–48 hours</b>.</p>

            <hr/>

            <p><b>Your Submitted Details:</b></p>
            <p><b>Phone:</b> ${user_phone}</p>
            <p><b>Organisation:</b> ${organization || "N/A"}</p>
            <p><b>Project Type:</b> ${project_type || "N/A"}</p>
            <p><b>Budget:</b> ${budget || "N/A"}</p>

            <br/>
            <p>Regards,<br/><b>A5X Industries Team</b></p>
          `,
        };

        // ✅ Send both in parallel (fast)
        const [adminRes, userRes] = await Promise.all([
          transporter.sendMail(adminMailOptions),
          transporter.sendMail(userMailOptions),
        ]);

        console.log("✅ Admin Mail Sent:", adminRes.messageId);
        console.log("✅ User Mail Sent:", userRes.messageId);
        console.log("✅ Contact Emails Sent Successfully ✅");
      } catch (mailErr) {
        console.log("❌ Email sending failed:", mailErr.message);
      }
    }, 0);
  } catch (error) {
    console.log("❌ Contact API Error:", error.message);
  }
};
