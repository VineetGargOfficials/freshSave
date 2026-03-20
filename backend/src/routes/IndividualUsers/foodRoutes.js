const express = require('express');
const {
  getFoodItems,
  getFoodItem,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
  getExpiringItems,
  consumeFood,
  getStats,
  scanFridgeItems,
  getScanHistory
} = require('../../controllers/foodController');
const { protect } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

const router = express.Router();

router.use(protect); // All routes are protected

router.route('/')
  .get(getFoodItems)
  .post(addFoodItem);

router.get('/stats', getStats);
router.get('/scan-history', getScanHistory);
router.post('/scan', upload.single('image'), scanFridgeItems);
router.get('/expiring/:days', getExpiringItems);

router.route('/:id')
  .get(getFoodItem)
  .put(updateFoodItem)
  .delete(deleteFoodItem);

router.put('/:id/consume', consumeFood);

module.exports = router;
