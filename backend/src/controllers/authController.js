const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../services/emailService');

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profileImage: user.profileImage,
      organizationName: user.organizationName,
      organizationType: user.organizationType
    }
  });
};

exports.register = async (req, res) => {
  try {
    const { 
      name, email, password, role, phoneNumber, organizationName,
      organizationType, organizationDescription, servingCapacity,
      address, latitude, longitude
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

   

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const userData = {
      name,
      email,
      password,
      role: role || 'user'
    };

    if (phoneNumber) userData.phoneNumber = phoneNumber;
    if (organizationName) userData.organizationName = organizationName;
    if (organizationType) userData.organizationType = organizationType;
    if (organizationDescription) userData.organizationDescription = organizationDescription;
    if (servingCapacity) userData.servingCapacity = parseInt(servingCapacity);

    if (address && (address.city || address.street)) {
      userData.address = {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'India',
        fullAddress: address.fullAddress || `${address.street || ''}, ${address.city || ''}`
      };
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        userData.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }
    }

    const user = await User.create(userData);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    await user.save();

    // IMPORTANT: Send verification email
    console.log(`📧 Attempting to send verification email to: ${user.email}`);
    
    try {
      const emailResult = await emailService.sendVerificationEmail(user.email, verificationToken);
      
      if (emailResult.success) {
        console.log(`✅ Verification email sent successfully to ${user.email}`);
      } else {
        console.error(`❌ Failed to send verification email: ${emailResult.error}`);
        console.log(`⚠️ User registered but email not sent`);
      }
    } catch (emailError) {
      console.error(`❌ Email sending error:`, emailError);
      console.log(`⚠️ User registered but email failed`);
    }

    console.log(`✅ User registered: ${user.email} (${user.role})`);
    sendTokenResponse(user, 201, res, 'Registration successful! Please check your email to verify your account.');

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful!');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {};
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.phoneNumber) fieldsToUpdate.phoneNumber = req.body.phoneNumber;
    if (req.body.address) fieldsToUpdate.address = req.body.address;
    if (req.body.preferences) fieldsToUpdate.preferences = req.body.preferences;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, { new: true, runValidators: true });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }
    
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // Send password reset email
    console.log(`📧 Sending password reset email to: ${user.email}`);
    const emailResult = await emailService.sendPasswordResetEmail(user.email, resetToken);
    
    if (emailResult.success) {
      console.log(`✅ Password reset email sent to ${user.email}`);
    } else {
      console.error(`❌ Failed to send password reset email`);
    }
    
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ verificationToken });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }
    
    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    // Send welcome email
    console.log(`📧 Sending welcome email to: ${user.email}`);
    const emailResult = await emailService.sendWelcomeEmail(user.email, user.name, user.role);
    
    if (emailResult.success) {
      console.log(`✅ Welcome email sent to ${user.email}`);
    }
    
    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};