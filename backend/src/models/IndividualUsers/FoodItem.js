const mongoose = require('mongoose');

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
    enum: ['manual', 'voice', 'ocr', 'camera'],
    default: 'manual'
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
  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry - now;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (days < 0) {
    this.status = 'expired';
  } else if (days === 0) {
    this.status = 'urgent';
  } else if (days <= 3) {
    this.status = 'warning';
  } else {
    this.status = 'fresh';
  }
  return this.status;
};

// Pre-save middleware - MONGOOSE 8.x COMPATIBLE (NO next() callback)
foodItemSchema.pre('save', function() {
  if (this.isModified('expiryDate') || this.isNew) {
    this.updateStatus();
  }
});

module.exports = mongoose.model('FoodItem', foodItemSchema);