const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SPTP_HOST || 'smtp.gmail.com',
  port: process.env.SPTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SPTP_USER,
    pass: process.env.SPTP_PASS,
  },
});

// Send testimonial thank you email
const sendTestimonialThankYou = async (to, name) => {
  const mailOptions = {
    from: `"Lucia Printing" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to,
    subject: 'Thank You for Your Testimonial!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #f9f9f9; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: white; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Sharing Your Experience!</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you so much for taking the time to share your experience with Lucia Printing! Your testimonial means a lot to us and helps others learn about our services.</p>
            <p>We have received your testimonial and it will be reviewed by our team shortly. Once approved, it will be displayed on our website to inspire other customers.</p>
            <p>We truly appreciate your support and look forward to serving you again in the future!</p>
            <p>Best regards,<br>The Lucia Printing Team</p>
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Visit Our Website</a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

// Send testimonial approved email
const sendTestimonialApproved = async (to, name) => {
  const mailOptions = {
    from: `"Lucia Printing" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Testimonial is Now Live!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #f9f9f9; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #ef4444, #f97316); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 20px; background: white; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Your Testimonial is Live!</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Great news! Your testimonial has been approved and is now live on our website.</p>
            <p>Thank you for helping others learn about their experience with Lucia Printing. Your feedback is invaluable to us!</p>
            <p>We look forward to serving you again in the future.</p>
            <p>Best regards,<br>The Lucia Printing Team</p>
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">See Your Testimonial</a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendTestimonialThankYou,
  sendTestimonialApproved,
};