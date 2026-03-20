const User = require('../models/User');
const RestaurantReview = require('../models/RestaurantReview');

const allowedVerificationStatuses = new Set(['pending', 'under_review', 'verified', 'rejected']);

exports.getPendingNgoVerifications = async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo' })
      .select('name email organizationName ngoType phoneNumber address verificationStatus isVerified createdAt deliveryEnabled')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ngos.length,
      data: ngos
    });
  } catch (error) {
    console.error('Get NGO verifications error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load NGO verifications' });
  }
};

exports.updateNgoVerificationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!allowedVerificationStatuses.has(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be pending, under_review, verified, or rejected'
      });
    }

    const ngo = await User.findOne({ _id: req.params.id, role: 'ngo' });
    if (!ngo) {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    ngo.verificationStatus = status;
    ngo.isVerified = status === 'verified';
    await ngo.save();

    res.status(200).json({
      success: true,
      message: `NGO marked as ${status}`,
      data: ngo
    });
  } catch (error) {
    console.error('Update NGO verification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update NGO verification' });
  }
};

exports.getDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: { $in: ['ngo', 'restaurant'] } })
      .select('name email role organizationName phoneNumber address deliveryEnabled deliveryEnabledAt isVerified verificationStatus createdAt')
      .sort({ role: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: partners.length,
      data: partners
    });
  } catch (error) {
    console.error('Get delivery partners error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load delivery partners' });
  }
};

exports.updateDeliveryAccess = async (req, res) => {
  try {
    const { deliveryEnabled } = req.body;

    if (typeof deliveryEnabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'deliveryEnabled must be true or false'
      });
    }

    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ['ngo', 'restaurant'] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }

    user.deliveryEnabled = deliveryEnabled;
    user.deliveryEnabledAt = deliveryEnabled ? new Date() : null;
    user.deliveryEnabledBy = deliveryEnabled ? req.user.id : null;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Delivery ${deliveryEnabled ? 'enabled' : 'disabled'} for ${user.organizationName || user.name}`,
      data: user
    });
  } catch (error) {
    console.error('Update delivery access error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update delivery access' });
  }
};

exports.getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await RestaurantReview.find()
      .populate('restaurant', 'name organizationName email address')
      .populate('reviewer', 'name organizationName email role')
      .sort({ createdAt: -1 });

    const summary = await RestaurantReview.aggregate([
      {
        $group: {
          _id: '$restaurant',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const summaryMap = new Map(summary.map((item) => [String(item._id), item]));
    const formatted = reviews.map((review) => {
      const restaurantId = String(review.restaurant?._id || '');
      const stats = summaryMap.get(restaurantId);
      return {
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        reviewerRole: review.reviewerRole,
        createdAt: review.createdAt,
        restaurant: review.restaurant,
        reviewer: review.reviewer,
        restaurantAverageRating: stats?.averageRating || review.rating,
        restaurantTotalReviews: stats?.totalReviews || 1
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Get restaurant reviews error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load restaurant reviews' });
  }
};
