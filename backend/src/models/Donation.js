const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantName: {
    type: String,
    required: [true, 'Please provide restaurant/organization name'],
    trim: true
  },
  foodDescription: {
    type: String,
    required: [true, 'Please describe the food items'],
    maxlength: 1000
  },
  quantity: {
    type: String,
    required: [true, 'Please specify quantity']
  },
  foodType: {
    type: String,
    enum: ['cooked', 'packaged', 'fresh', 'mixed'],
    default: 'mixed'
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'picked_up', 'cancelled', 'expired'],
    default: 'available'
  },
  images: [{
    url: String,
    publicId: String
  }],
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimedAt: Date,
  pickupTime: Date,
  specialInstructions: {
    type: String,
    maxlength: 500
  },
  servings: Number,
  allergens: [String],
  contactPerson: {
    name: String,
    phone: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: String
}, {
  timestamps: true
});

// Index for geospatial queries
donationSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
donationSchema.index({ status: 1, availableUntil: 1 });

// Method to check if donation is still valid
donationSchema.methods.isValid = function() {
  return this.status === 'available' && new Date(this.availableUntil) > new Date();
};

module.exports = mongoose.model('Donation', donationSchema);