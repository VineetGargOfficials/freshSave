const mongoose = require('mongoose');

const restaurantReviewSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ['user', 'ngo'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true }
);

restaurantReviewSchema.index({ restaurant: 1, reviewer: 1 }, { unique: true });
restaurantReviewSchema.index({ restaurant: 1, createdAt: -1 });

module.exports = mongoose.model('RestaurantReview', restaurantReviewSchema);
