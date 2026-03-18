const Connection = require('../models/Connection');
const User = require('../models/User');
const { recomputeUserBadges } = require('../services/badgeService');

// @desc    Request connection with an NGO
// @route   POST /api/connections/request
// @access  Private (Restaurant/User)
exports.requestConnection = async (req, res) => {
  try {
    const { ngoId, message } = req.body;

    // Check if NGO exists and is actually an NGO
    const ngo = await User.findById(ngoId);
    if (!ngo || ngo.role !== 'ngo') {
      return res.status(404).json({ success: false, message: 'NGO not found' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      requester: req.user.id,
      ngo: ngoId
    });

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: `Connection request already sent (${existingConnection.status})`
      });
    }

    // Create the connection
    const connection = await Connection.create({
      requester: req.user.id,
      requesterRole: req.user.role,
      ngo: ngoId,
      message
    });

    res.status(201).json({
      success: true,
      data: connection
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Request already exists' });
    }
    console.error('Request Connection Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update connection status (Accept/Reject)
// @route   PUT /api/connections/:id/status
// @access  Private (NGO Only)
exports.updateConnectionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const connection = await Connection.findById(req.params.id);

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection not found' });
    }

    // Ensure the current user is the target NGO
    if (connection.ngo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: `Not authorized. You are ${req.user._id.toString()}, but this request is for ${connection.ngo.toString()}` 
      });
    }

    connection.status = status;
    await connection.save();
    await Promise.all([
      recomputeUserBadges(connection.requester),
      recomputeUserBadges(connection.ngo)
    ]);

    // Note: Can optionally add logic to push to connectedPartners arrays if you have them in the User model later.

    res.status(200).json({
      success: true,
      data: connection
    });
  } catch (error) {
    console.error('Update Connection Status Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get user's connections (acts dynamically depending on who is requesting)
// @route   GET /api/connections/my
// @access  Private
exports.getMyConnections = async (req, res) => {
  try {
    const filter = {
      $or: [
        { ngo: req.user.id },
        { requester: req.user.id }
      ]
    };

    const connections = await Connection.find(filter)
      .populate('requester', 'name organizationName email address phoneNumber')
      .populate('ngo', 'name organizationName email address phoneNumber ngoType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: connections
    });
  } catch (error) {
    console.error('Get My Connections Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
