const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// ─── Helper: build full user payload for token responses ─────────────────────
const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
  profileImage: user.profileImage,
  phoneNumber: user.phoneNumber,
  alternatePhone: user.alternatePhone,
  website: user.website,
  bio: user.bio,
  address: user.address,
  location: user.location,
  // Restaurant / Caterer
  organizationName: user.organizationName,
  organizationType: user.organizationType,
  fssaiLicense: user.fssaiLicense,
  cuisineTypes: user.cuisineTypes,
  seatingCapacity: user.seatingCapacity,
  dailySurplusCapacity: user.dailySurplusCapacity,
  operatingHours: user.operatingHours,
  donationMode: user.donationMode,
  isHalalCertified: user.isHalalCertified,
  isVegetarianOnly: user.isVegetarianOnly,
  // NGO
  ngoRegistrationNumber: user.ngoRegistrationNumber,
  ngoType: user.ngoType,
  beneficiaryTypes: user.beneficiaryTypes,
  dailyBeneficiaries: user.dailyBeneficiaries,
  totalBeneficiaries: user.totalBeneficiaries,
  hasPickupVehicle: user.hasPickupVehicle,
  pickupRadius: user.pickupRadius,
  hasRefrigeration: user.hasRefrigeration,
  storageCapacityKg: user.storageCapacityKg,
  preferredFoodTypes: user.preferredFoodTypes,
  // Common org
  organizationDescription: user.organizationDescription,
  foundedYear: user.foundedYear,
  socialLinks: user.socialLinks,
  // Verification
  isVerified: user.isVerified,
  verificationStatus: user.verificationStatus,
  createdAt: user.createdAt
});

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: buildUserPayload(user)
  });
};

// ── Valid enum values for validation ──────────────────────────────────────────
const VALID_ORGANIZATION_TYPES = [
  'restaurant', 'cloud_kitchen', 'catering', 'hotel', 'cafe', 'bakery',
  'food_truck', 'ngo', 'corporate_canteen', 'school_canteen', 'other'
];

const VALID_NGO_TYPES = [
  'orphanage', 'old_age_home', 'shelter', 'food_bank', 'community_kitchen',
  'educational_trust', 'hospital', 'rehabilitation', 'animal_shelter', 'other'
];

// ─── REGISTER ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, role, phoneNumber, alternatePhone, website, bio,
      // Restaurant fields
      organizationName, organizationType, fssaiLicense, cuisineTypes,
      seatingCapacity, dailySurplusCapacity, operatingHours,
      donationMode, isHalalCertified, isVegetarianOnly,
      // NGO fields
      ngoRegistrationNumber, ngoType, beneficiaryTypes,
      dailyBeneficiaries, totalBeneficiaries,
      hasPickupVehicle, pickupRadius,
      hasRefrigeration, storageCapacityKg, preferredFoodTypes,
      // Common org
      organizationDescription, foundedYear, socialLinks,
      // Address / location
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

    // Build base data
    const userData = {
      name,
      email,
      password,
      role: role || 'user'
    };

    // Contact
    if (phoneNumber) userData.phoneNumber = phoneNumber;
    if (alternatePhone) userData.alternatePhone = alternatePhone;
    if (website) userData.website = website;
    if (bio) userData.bio = bio;

    // Address
    if (address && (address.city || address.street)) {
      userData.address = {
        street: address.street || '',
        area: address.area || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || 'India',
        fullAddress: address.fullAddress ||
          [address.street, address.area, address.city, address.state].filter(Boolean).join(', ')
      };
    }

    // GeoJSON coordinates
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        userData.location = { type: 'Point', coordinates: [lng, lat] };
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // RESTAURANT / CATERER fields
    // ══════════════════════════════════════════════════════════════════════════
    if (role === 'restaurant') {
      if (organizationName) userData.organizationName = organizationName;
      
      // FIX: Validate organizationType against allowed values
      if (organizationType && VALID_ORGANIZATION_TYPES.includes(organizationType)) {
        userData.organizationType = organizationType;
      } else {
        // Default to 'restaurant' if not provided or invalid
        userData.organizationType = 'restaurant';
      }
      
      if (fssaiLicense) userData.fssaiLicense = fssaiLicense;
      if (cuisineTypes) userData.cuisineTypes = Array.isArray(cuisineTypes) ? cuisineTypes : [cuisineTypes];
      if (seatingCapacity) userData.seatingCapacity = parseInt(seatingCapacity);
      if (dailySurplusCapacity) userData.dailySurplusCapacity = parseInt(dailySurplusCapacity);
      if (operatingHours) userData.operatingHours = operatingHours;
      if (donationMode) userData.donationMode = donationMode;
      if (typeof isHalalCertified !== 'undefined') userData.isHalalCertified = Boolean(isHalalCertified);
      if (typeof isVegetarianOnly !== 'undefined') userData.isVegetarianOnly = Boolean(isVegetarianOnly);
      if (organizationDescription) userData.organizationDescription = organizationDescription;
      if (foundedYear) userData.foundedYear = parseInt(foundedYear);
      if (socialLinks) userData.socialLinks = socialLinks;
    }

    // ══════════════════════════════════════════════════════════════════════════
    // NGO fields - FIX: organizationType is always 'ngo', specific type goes to ngoType
    // ══════════════════════════════════════════════════════════════════════════
    if (role === 'ngo') {
      if (organizationName) userData.organizationName = organizationName;
      
      // FIX: For NGOs, organizationType is always 'ngo'
      // The specific NGO subtype (orphanage, shelter, etc.) goes into ngoType
      userData.organizationType = 'ngo';
      
      if (ngoRegistrationNumber) userData.ngoRegistrationNumber = ngoRegistrationNumber;
      
      // FIX: Validate ngoType against allowed values
      if (ngoType && VALID_NGO_TYPES.includes(ngoType)) {
        userData.ngoType = ngoType;
      }
      
      if (beneficiaryTypes) userData.beneficiaryTypes = Array.isArray(beneficiaryTypes) ? beneficiaryTypes : [beneficiaryTypes];
      if (dailyBeneficiaries) userData.dailyBeneficiaries = parseInt(dailyBeneficiaries);
      if (totalBeneficiaries) userData.totalBeneficiaries = parseInt(totalBeneficiaries);
      if (typeof hasPickupVehicle !== 'undefined') userData.hasPickupVehicle = Boolean(hasPickupVehicle);
      if (pickupRadius) userData.pickupRadius = parseInt(pickupRadius);
      if (typeof hasRefrigeration !== 'undefined') userData.hasRefrigeration = Boolean(hasRefrigeration);
      if (storageCapacityKg) userData.storageCapacityKg = parseInt(storageCapacityKg);
      if (preferredFoodTypes) userData.preferredFoodTypes = Array.isArray(preferredFoodTypes) ? preferredFoodTypes : [preferredFoodTypes];
      if (organizationDescription) userData.organizationDescription = organizationDescription;
      if (foundedYear) userData.foundedYear = parseInt(foundedYear);
      if (socialLinks) userData.socialLinks = socialLinks;
    }

    const user = await User.create(userData);

    // Email verification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    await user.save();

    try {
      const emailResult = await emailService.sendVerificationEmail(user.email, verificationToken);
      if (emailResult.success) {
        console.log(`✅ Verification email sent to ${user.email}`);
      } else {
        console.error(`❌ Failed to send verification email: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.error('❌ Email error:', emailError.message);
    }

    console.log(`✅ User registered: ${user.email} (${user.role})`);
    sendTokenResponse(user, 201, res, 'Registration successful! Please check your email to verify your account.');

  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    console.log(`✅ User logged in: ${user.email} (${user.role})`);
    sendTokenResponse(user, 200, res, 'Login successful!');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

// ─── GET ME ──────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user: buildUserPayload(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const allowedFields = [
      'name', 'phoneNumber', 'alternatePhone', 'website', 'bio', 'address', 'preferences',
      // Restaurant
      'organizationName', 'organizationType', 'fssaiLicense', 'cuisineTypes',
      'seatingCapacity', 'dailySurplusCapacity', 'operatingHours',
      'donationMode', 'isHalalCertified', 'isVegetarianOnly',
      // NGO
      'ngoRegistrationNumber', 'ngoType', 'beneficiaryTypes',
      'dailyBeneficiaries', 'totalBeneficiaries',
      'hasPickupVehicle', 'pickupRadius',
      'hasRefrigeration', 'storageCapacityKg', 'preferredFoodTypes',
      // Common
      'organizationDescription', 'foundedYear', 'socialLinks'
    ];

    const fieldsToUpdate = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    // ══════════════════════════════════════════════════════════════════════════
    // FIX: Validate organizationType based on user role
    // ══════════════════════════════════════════════════════════════════════════
    if (fieldsToUpdate.organizationType) {
      if (user.role === 'ngo') {
        // For NGOs, organizationType must always be 'ngo'
        // If they're trying to set it to something else, ignore it
        if (fieldsToUpdate.organizationType !== 'ngo') {
          console.log(`⚠️ NGO tried to set organizationType to '${fieldsToUpdate.organizationType}', forcing to 'ngo'`);
          fieldsToUpdate.organizationType = 'ngo';
        }
      } else if (user.role === 'restaurant') {
        // For restaurants, validate against allowed types
        if (!VALID_ORGANIZATION_TYPES.includes(fieldsToUpdate.organizationType)) {
          delete fieldsToUpdate.organizationType;
        }
      }
    }

    // FIX: Validate ngoType if provided
    if (fieldsToUpdate.ngoType && !VALID_NGO_TYPES.includes(fieldsToUpdate.ngoType)) {
      delete fieldsToUpdate.ngoType;
    }

    // Handle location update
    if (req.body.latitude && req.body.longitude) {
      const lat = parseFloat(req.body.latitude);
      const lng = parseFloat(req.body.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        fieldsToUpdate.location = { type: 'Point', coordinates: [lng, lat] };
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, user: buildUserPayload(updatedUser) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const emailResult = await emailService.sendPasswordResetEmail(user.email, resetToken);
    if (emailResult.success) {
      console.log(`✅ Password reset email sent to ${user.email}`);
    }
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

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

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
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

    const emailResult = await emailService.sendWelcomeEmail(user.email, user.name, user.role);
    if (emailResult.success) {
      console.log(`✅ Welcome email sent to ${user.email}`);
    }

    res.status(200).json({ success: true, message: 'Email verified successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};