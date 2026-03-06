const express = require('express');
const {
  getDonations,
  getDonation,
  createDonation,
  updateDonation,
  claimDonation,
  markAsPickedUp,
  deleteDonation,
  getMyDonations,
  getMyClaims
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getDonations)
  .post(protect, createDonation);

router.get('/my-donations', protect, getMyDonations);
router.get('/my-claims', protect, authorize('ngo'), getMyClaims);

router.route('/:id')
  .get(getDonation)
  .put(protect, updateDonation)
  .delete(protect, deleteDonation);

router.put('/:id/claim', protect, authorize('ngo'), claimDonation);
router.put('/:id/pickup', protect, markAsPickedUp);

module.exports = router;