const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  // ── Core ──────────────────────────────────────────────────────────────────
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'restaurant', 'ngo', 'admin'],
    default: 'user'
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  phoneNumber: { type: String },
  alternatePhone: { type: String },
  website: { type: String },

  // ── Address / Location ────────────────────────────────────────────────────
  address: {
    street: String,
    area: String,          // locality / neighbourhood
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
    fullAddress: String
  },
  // GeoJSON point for geo-queries
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }  // [lng, lat]
  },

  // ── Profile ───────────────────────────────────────────────────────────────
  profileImage: { type: String, default: 'default-avatar.png' },
  bio: { type: String, maxlength: 500 },

  // ══════════════════════════════════════════════════════════════════════════
  // RESTAURANT / CATERER details
  // ══════════════════════════════════════════════════════════════════════════
  organizationName: { type: String, trim: true },

  organizationType: {
    type: String,
    enum: ['restaurant', 'cloud_kitchen', 'catering', 'hotel', 'cafe', 'bakery', 'food_truck', 'ngo', 'corporate_canteen', 'school_canteen', 'other']
  },

  // FSSAI / Food safety licence number
  fssaiLicense: { type: String },

  // Cuisine types (for restaurants)
  cuisineTypes: [{
    type: String,
    enum: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Continental', 'Fast Food',
           'South Indian', 'North Indian', 'Mughlai', 'Seafood', 'Vegan',
           'Bakery', 'Multi-Cuisine', 'Other']
  }],

  // Seating / capacity
  seatingCapacity: { type: Number },
  dailySurplusCapacity: { type: Number },  // meals / kg per day they can list

  // Operating hours
  operatingHours: {
    monday:    { open: String, close: String, isClosed: { type: Boolean, default: false } },
    tuesday:   { open: String, close: String, isClosed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    thursday:  { open: String, close: String, isClosed: { type: Boolean, default: false } },
    friday:    { open: String, close: String, isClosed: { type: Boolean, default: false } },
    saturday:  { open: String, close: String, isClosed: { type: Boolean, default: false } },
    sunday:    { open: String, close: String, isClosed: { type: Boolean, default: false } }
  },

  // Donation preference
  donationMode: {
    type: String,
    enum: ['pickup_only', 'delivery', 'both'],
    default: 'pickup_only'
  },

  isHalalCertified: { type: Boolean, default: false },
  isVegetarianOnly: { type: Boolean, default: false },

  // ══════════════════════════════════════════════════════════════════════════
  // NGO / CHARITY details
  // ══════════════════════════════════════════════════════════════════════════
  ngoRegistrationNumber: { type: String },

  ngoType: {
    type: String,
    enum: ['orphanage', 'old_age_home', 'shelter', 'food_bank', 'community_kitchen',
           'educational_trust', 'hospital', 'rehabilitation', 'animal_shelter', 'other']
  },

  // Who they serve
  beneficiaryTypes: [{
    type: String,
    enum: ['children', 'elderly', 'homeless', 'disabled', 'refugees', 'animals', 'general_public', 'other']
  }],

  // How many people they serve
  dailyBeneficiaries: { type: Number },  // meals served per day
  totalBeneficiaries: { type: Number },  // total registered beneficiaries

  // Can they pick up food?
  hasPickupVehicle: { type: Boolean, default: false },
  pickupRadius: { type: Number },   // km radius they can cover

  // Storage
  hasRefrigeration: { type: Boolean, default: false },
  storageCapacityKg: { type: Number },

  // Preferred food types they need
  preferredFoodTypes: [{ type: String }],

  // Verification docs
  ngoDocumentUrl: { type: String },  // uploaded certificate

  // ── Common org fields ─────────────────────────────────────────────────────
  organizationDescription: { type: String, maxlength: 1000 },
  foundedYear: { type: Number },
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },

  // Verification / onboarding status
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected'],
    default: 'pending'
  },

  // ── User preferences ──────────────────────────────────────────────────────
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    expiryReminder: { type: Number, default: 3 }
  },
  badges: [{
    badgeId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    color: { type: String, required: true },
    icon: { type: String, required: true },
    awardedAt: { type: Date, default: Date.now }
  }],

  // ── Auth tokens ───────────────────────────────────────────────────────────
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,

  createdAt: { type: Date, default: Date.now }

}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// ── Geo index ─────────────────────────────────────────────────────────────────
userSchema.index({ location: '2dsphere' });
userSchema.index({ role: 1 });
userSchema.index({ 'address.city': 1 });

// ── Password hashing ──────────────────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Methods ───────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
