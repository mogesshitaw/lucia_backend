// src/utils/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(email, name, code) {
    const verificationLink = `${process.env.FRONTEND_URL}/page/verify-email?email=${encodeURIComponent(email)}`;
    
    const mailOptions = {
      from: `"Lucia Printing" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Email - Lucia Printing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Lucia Printing</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${name}!</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
              Thank you for registering with Lucia Printing. Please use the verification code below to verify your email address:
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ef4444;">${code}</span>
            </div>
            
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              Or click the button below to verify:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
            </div>
            
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
              This code will expire in 24 hours. If you didn't create an account with Lucia Printing, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              &copy; ${new Date().getFullYear()} Lucia Printing. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();