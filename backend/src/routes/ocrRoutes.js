const express = require('express');
const { scanFoodImage, extractText } = require('../controllers/ocrController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/ocr/scan
// @desc    Scan food item from image and extract expiry date
// @access  Private
router.post('/scan', protect, upload.single('image'), scanFoodImage);

// @route   POST /api/ocr/extract-text
// @desc    Extract raw text from image
// @access  Private
router.post('/extract-text', protect, upload.single('image'), extractText);

module.exports = router;