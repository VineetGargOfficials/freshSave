const nodemailer = require('nodemailer');

const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  return nodemailer.createTransport(config);
};

exports.sendVerificationEmail = async (email, token) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email not configured');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    // IMPORTANT: Use the correct frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const verificationUrl = `${frontendUrl}/verify-email/${token}`;

    console.log('📧 Verification URL:', verificationUrl); // Debug log

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '✅ Verify Your Email - FreshSave',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 20px; 
              text-align: center; 
            }
            .header h1 { margin: 0; font-size: 28px; }
            .content { 
              padding: 40px 30px; 
              background: white;
            }
            .button { 
              display: inline-block; 
              padding: 15px 40px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #666; 
              font-size: 12px;
              background: #f9f9f9;
            }
            .link-box {
              background: #f5f5f5;
              padding: 12px;
              border-radius: 5px;
              word-break: break-all;
              font-size: 11px;
              color: #666;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="font-size: 48px; margin-bottom: 10px;">🌱</div>
              <h1>Welcome to FreshSave!</h1>
            </div>
            <div class="content">
              <h2 style="color: #667eea;">Verify Your Email</h2>
              <p>Thank you for joining FreshSave! Click the button below to verify your email address:</p>
              <center>
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </center>
              <p style="margin-top: 30px; font-size: 13px; color: #666;">
                Or copy and paste this link in your browser:
              </p>
              <div class="link-box">
                ${verificationUrl}
              </div>
              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This verification link will expire in 24 hours.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2025 FreshSave. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}:`, info.messageId);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};


// Send password reset email
exports.sendPasswordResetEmail = async (email, token) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Email not configured');
      return { success: false };
    }

    const transporter = createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '🔒 Password Reset Request - FreshSave',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="font-size: 48px; margin: 0;">🔒</h1>
            <h2>Password Reset</h2>
          </div>
          <div style="padding: 40px 30px; background: white;">
            <p>We received a request to reset your password.</p>
            <center>
              <a href="${resetUrl}" style="display: inline-block; padding: 15px 40px; background: #f5576c; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Password</a>
            </center>
            <p style="color: #999; margin-top: 20px; font-size: 12px;">This link expires in 10 minutes.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
exports.sendWelcomeEmail = async (email, name, role) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return { success: false };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Welcome to FreshSave!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="font-size: 48px; margin: 0;">🎉</h1>
            <h2>Welcome ${name}!</h2>
          </div>
          <div style="padding: 40px 30px; background: white;">
            <p style="font-size: 18px;">Your account has been verified!</p>
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; padding: 15px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Go to Dashboard</a>
            </center>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Welcome email failed:', error);
    return { success: false };
  }
};

// Test email configuration
exports.testEmailConfig = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email credentials not configured in .env');
      return false;
    }

    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};