const mongoose = require('mongoose');

const restaurantFoodListingSchema = new mongoose.Schema({
  // The restaurant (user with role 'restaurant') who created this listing
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Restaurant reference is required']
  },

  // Basic food info
  name: {
    type: String,
    required: [true, 'Food item name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Snacks', 'Salads', 'Soups', 'Breakfast', 'Sides', 'Other'],
    default: 'Other'
  },

  // Availability & pricing
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  quantityAvailable: {
    type: Number,
    default: 1,
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    enum: ['pieces', 'kg', 'g', 'liters', 'ml', 'portions', 'boxes', 'packs'],
    default: 'pieces'
  },

  // Expiry / freshness info (useful for surplus/near-expiry items)
  expiryDate: {
    type: Date
  },
  preparedAt: {
    type: Date,
    default: Date.now
  },

  // Listing type
  listingType: {
    type: String,
    enum: ['regular', 'surplus', 'discount', 'donation'],
    default: 'regular'
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Dietary info
  dietary: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isHalal: { type: Boolean, default: false },
    isKosher: { type: Boolean, default: false }
  },

  // Allergens
  allergens: [{
    type: String,
    enum: ['Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts', 'Peanuts', 'Wheat', 'Soybeans', 'Sesame']
  }],

  // Image
  image: {
    url: String,
    publicId: String
  },

  // Status
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'sold_out', 'expired', 'removed'],
    default: 'active'
  },

  // Stats
  totalReservations: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for fast querying
restaurantFoodListingSchema.index({ restaurant: 1, isAvailable: 1 });
restaurantFoodListingSchema.index({ category: 1 });
restaurantFoodListingSchema.index({ listingType: 1 });
restaurantFoodListingSchema.index({ status: 1 });

// Virtual: discounted price
restaurantFoodListingSchema.virtual('discountedPrice').get(function () {
  if (this.discountPercentage && this.discountPercentage > 0) {
    return +(this.price * (1 - this.discountPercentage / 100)).toFixed(2);
  }
  return this.price;
});

// Virtual: days until expiry
restaurantFoodListingSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const diffMs = new Date(this.expiryDate) - new Date();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

// Pre-save: auto-expire listings past their expiry date
restaurantFoodListingSchema.pre('save', function () {
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    this.status = 'expired';
    this.isAvailable = false;
  }
  if (this.quantityAvailable === 0) {
    this.status = 'sold_out';
    this.isAvailable = false;
  }
});

module.exports = mongoose.model('RestaurantFoodListing', restaurantFoodListingSchema);
