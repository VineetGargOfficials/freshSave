const ocrService = require('../services/ocrService');

// @desc    Scan food item from image
// @route   POST /api/ocr/scan
// @access  Private
exports.scanFoodImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }
    
    const result = await ocrService.processFoodImage(req.file.buffer);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Scan food image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to scan image'
    });
  }
};

// @desc    Extract text from image
// @route   POST /api/ocr/extract-text
// @access  Private
exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }
    
    const text = await ocrService.extractTextFromImage(req.file.buffer);
    
    res.status(200).json({
      success: true,
      data: { text }
    });

  } catch (error) {
    console.error('Extract text error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract text'
    });
  }
};