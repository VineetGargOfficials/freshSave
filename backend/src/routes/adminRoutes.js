const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getPendingNgoVerifications,
  updateNgoVerificationStatus,
  getDeliveryPartners,
  updateDeliveryAccess,
  getRestaurantReviews
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/ngos', getPendingNgoVerifications);
router.patch('/ngos/:id/verification', updateNgoVerificationStatus);
router.get('/delivery-partners', getDeliveryPartners);
router.patch('/users/:id/delivery', updateDeliveryAccess);
router.get('/restaurant-reviews', getRestaurantReviews);

module.exports = router;
