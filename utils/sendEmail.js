const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // const mailOptions = {
    //     from: `<${process.env.EMAIL_USER}>`,
    //     to,
    //     subject,
    //     text,
    //     html: `<p>${text}</p>`,
    // };


    const mailOptions = {
      from: '"MRR Support" <support@myresearchroom.com>',
      to,
      subject: subject || "Login Verification Code from MRR",
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          <h2 style="color: #000000; text-align: center;">Login Verification Code from MRR PMS</h2>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
          
          <p style="font-size: 16px;">Dear User,</p>
          <p style="font-size: 16px;">Your One-Time Password (OTP) for logging in to <strong>MRR PMS</strong> is:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #000000;">${otp}</span>
          </div>

          <p style="font-size: 14px;">This code is valid for <strong>5 minutes</strong> and can only be used once.</p>

          <div style="background-color: #fff3cd; padding: 15px; border-left: 5px solid #ffc107; margin: 20px 0;">
            <strong>🔒 Security Tip:</strong><br>
            Never share your OTP with anyone. MRR will never ask for your OTP or password via phone, email, or SMS.
          </div>

          <p>If you didn’t request this OTP, please ignore this email or contact our support team.</p>

          <strong style="margin-top: 30px;">– Team MRR<br>
          <a href="https://myresearchroom.com" style="color: #4285F4;">https://myresearchroom.com</a><br>
          <a href="mailto:support@myresearchroom.com" style="color: #4285F4;">info@myresearchroom.com</a></p>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="font-size: 12px; color: #888;">
            This is an automated message from MRR (My Research Room). Please do not reply.<br>
            If you received this email in error, please contact our support team for assistance.<br><br>
            © 2025 MRR. All rights reserved.
          </p>
        </div>
      </div>
    `
    };


    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully.");
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw error;
  }
};


module.exports = sendEmail;
