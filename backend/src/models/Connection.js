const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterRole: {
    type: String,
    enum: ['restaurant', 'user'],
    required: true
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String
  }
}, { timestamps: true });

// Prevent duplicate connections per requester+ngo combination
connectionSchema.index({ requester: 1, ngo: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
