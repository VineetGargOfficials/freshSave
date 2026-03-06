const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send verification email
exports.sendVerificationEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
      from: `"FreshSave" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - FreshSave',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌱 Welcome to FreshSave!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for joining FreshSave - your partner in reducing food waste!</p>
              <p>Click the button below to verify your email address and activate your account:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email</a>
              </center>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 FreshSave. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
      from: `"FreshSave" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - FreshSave',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password for your FreshSave account.</p>
              <p>Click the button below to reset your password:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p>This link will expire in 10 minutes. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 FreshSave. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send expiry notification
exports.sendExpiryNotification = async (email, foodItems) => {
  try {
    const transporter = createTransporter();

    const itemsList = foodItems
      .map(
        (item) =>
          `<li><strong>${item.name}</strong> - Expires in ${item.daysUntilExpiry} day(s)</li>`
      )
      .join('');

    const mailOptions = {
      from: `"FreshSave" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '⚠️ Food Items Expiring Soon - FreshSave',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .items-list { background: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #fa709a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Food Expiring Soon!</h1>
            </div>
            <div class="content">
              <h2>Don't Let Food Go to Waste</h2>
              <p>The following items in your kitchen are expiring soon:</p>
              <div class="items-list">
                <ul>${itemsList}</ul>
              </div>
              <p>💡 <strong>Quick Actions:</strong></p>
              <ul>
                <li>Check our recipe suggestions to use these items</li>
                <li>Freeze items that are suitable for freezing</li>
                <li>Consider donating if you can't use them</li>
              </ul>
              <center>
                <a href="${process.env.FRONTEND_URL}/recipes" class="button">Get Recipe Ideas</a>
              </center>
            </div>
            <div class="footer">
              <p>&copy; 2025 FreshSave. Reducing food waste together.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Expiry notification sent to ${email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Failed to send expiry notification');
  }
};

// Send donation notification to NGO
exports.sendDonationNotification = async (email, donation) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"FreshSave" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🎁 New Food Donation Available - FreshSave',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4caf50; }
            .button { display: inline-block; padding: 12px 30px; background: #4caf50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎁 New Donation Available</h1>
            </div>
            <div class="content">
              <h2>${donation.restaurantName}</h2>
              <div class="info-box">
                <p><strong>Food Description:</strong> ${donation.foodDescription}</p>
                <p><strong>Quantity:</strong> ${donation.quantity}</p>
                <p><strong>Pickup Location:</strong> ${donation.pickupLocation.address}</p>
                <p><strong>Available Until:</strong> ${new Date(donation.availableUntil).toLocaleString()}</p>
              </div>
              <p>This donation is now available for pickup. Please claim it as soon as possible.</p>
              <center>
                <a href="${process.env.FRONTEND_URL}/donations" class="button">View & Claim</a>
              </center>
            </div>
            <div class="footer">
              <p>&copy; 2025 FreshSave. Fighting hunger, reducing waste.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Donation notification sent to ${email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};