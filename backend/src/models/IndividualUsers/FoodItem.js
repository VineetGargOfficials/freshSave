const mongoose = require('mongoose');

const calculateStatusFromExpiry = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - now;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return 'expired';
  }
  if (days === 0) {
    return 'urgent';
  }
  if (days <= 3) {
    return 'warning';
  }
  return 'fresh';
};

const foodItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide food item name'],
    trim: true
  },
  quantity: {
    type: String,
    default: '1'
  },
  category: {
    type: String,
    enum: ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains', 'Beverages', 'Snacks', 'Condiments', 'Frozen', 'Other'],
    default: 'Other'
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please provide expiry date']
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  storageLocation: {
    type: String,
    enum: ['fridge', 'freezer', 'pantry', 'counter'],
    default: 'fridge'
  },
  image: {
    url: String,
    publicId: String
  },
  barcode: String,
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  status: {
    type: String,
    enum: ['fresh', 'warning', 'urgent', 'expired', 'consumed'],
    default: 'fresh'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  addedVia: {
    type: String,
    enum: ['manual', 'voice', 'ocr', 'camera', 'fridge_scan'],
    default: 'manual'
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1
  },
  expirySource: {
    type: String,
    enum: ['manual', 'ocr_detected', 'ai_predicted', 'user_input'],
    default: 'manual'
  },
  scanSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScanHistory'
  },
  rawScanText: {
    type: String
  },
  scanMetadata: {
    imageName: String,
    detectionProvider: String,
    detectedAt: Date
  },
  alertSent: {
    type: Boolean,
    default: false
  },
  alertDaysBefore: {
    type: Number,
    default: 3
  },
  consumed: {
    type: Boolean,
    default: false
  },
  consumedDate: Date
}, {
  timestamps: true
});

// Index for querying
foodItemSchema.index({ user: 1, expiryDate: 1 });
foodItemSchema.index({ status: 1 });

// Virtual for days until expiry
foodItemSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to update status based on expiry
foodItemSchema.methods.updateStatus = function() {
  this.status = calculateStatusFromExpiry(this.expiryDate);
  return this.status;
};

foodItemSchema.statics.calculateStatusFromExpiry = calculateStatusFromExpiry;

// Pre-save middleware - MONGOOSE 8.x COMPATIBLE (NO next() callback)
foodItemSchema.pre('save', function() {
  if (this.isModified('expiryDate') || this.isNew) {
    this.updateStatus();
  }

  if (this.isModified('expiryDate') || this.isModified('consumed') || this.isNew) {
    this.alertSent = false;
  }
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
