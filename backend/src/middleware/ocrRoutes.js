const express = require('express');
const { scanFoodImage, extractText } = require('../controllers/ocrController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/scan', protect, upload.single('image'), scanFoodImage);
router.post('/extract-text', protect, upload.single('image'), extractText);

module.exports = router;