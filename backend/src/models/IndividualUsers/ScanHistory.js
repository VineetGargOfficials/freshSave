const mongoose = require('mongoose');

const detectedItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  quantity: String,
  expiryDate: Date,
  expirySource: String,
  confidenceScore: Number,
  rawScanText: String
}, { _id: false });

const scanHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  imageName: String,
  imageMimeType: String,
  totalItemsDetected: {
    type: Number,
    default: 0
  },
  totalItemsSaved: {
    type: Number,
    default: 0
  },
  processingTimeMs: Number,
  scanStatus: {
    type: String,
    enum: ['success', 'partial', 'failed'],
    default: 'success'
  },
  errorMessage: String,
  detectedItems: [detectedItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
