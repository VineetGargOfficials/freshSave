const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'listingModel',
    required: true
  },
  listingModel: {
    type: String,
    required: true,
    enum: ['RestaurantFoodListing', 'Donation']
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    default: 'portions'
  },
  status: {
    type: String,
    enum: ['claimed', 'picked_up', 'distributed', 'cancelled'],
    default: 'claimed'
  },
  fulfillmentMethod: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'pickup'
  },
  claimedAt: {
    type: Date,
    default: Date.now
  },
  pickupTime: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for restaurants to find claims on their listings
claimSchema.index({ listing: 1, ngo: 1 });

module.exports = mongoose.model('Claim', claimSchema);
