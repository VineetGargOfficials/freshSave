const Donation = require('../models/IndividualUsers/Donation');

// @desc    Get all donations
// @route   GET /api/donations
// @access  Public
exports.getDonations = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    query.status = status || 'available';
    
    const donations = await Donation.find(query)
      .populate('donor', 'name organizationName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });

  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get donations'
    });
  }
};

// @desc    Get single donation
// @route   GET /api/donations/:id
// @access  Public
exports.getDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name organizationName phoneNumber email')
      .populate('claimedBy', 'name organizationName phoneNumber');
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: donation
    });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get donation'
    });
  }
};

// @desc    Create donation
// @route   POST /api/donations
// @access  Private
exports.createDonation = async (req, res) => {
  try {
    req.body.donor = req.user.id;
    
    const donation = await Donation.create(req.body);
    
    res.status(201).json({
      success: true,
      data: donation
    });

  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create donation'
    });
  }
};

// @desc    Update donation
// @route   PUT /api/donations/:id
// @access  Private
exports.updateDonation = async (req, res) => {
  try {
    let donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donation'
      });
    }
    
    donation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: donation
    });

  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update donation'
    });
  }
};

// @desc    Claim donation
// @route   PUT /api/donations/:id/claim
// @access  Private
exports.claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    if (donation.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Donation is not available'
      });
    }
    
    donation.status = 'claimed';
    donation.claimedBy = req.user.id;
    donation.claimedAt = Date.now();
    await donation.save();
    
    res.status(200).json({
      success: true,
      data: donation,
      message: 'Donation claimed successfully'
    });

  } catch (error) {
    console.error('Claim donation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to claim donation'
    });
  }
};

// @desc    Mark donation as picked up
// @route   PUT /api/donations/:id/pickup
// @access  Private
exports.markAsPickedUp = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    donation.status = 'picked_up';
    donation.pickupTime = Date.now();
    await donation.save();
    
    res.status(200).json({
      success: true,
      data: donation,
      message: 'Donation marked as picked up'
    });

  } catch (error) {
    console.error('Mark as picked up error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update donation'
    });
  }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }
    
    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this donation'
      });
    }
    
    await donation.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Donation deleted'
    });

  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete donation'
    });
  }
};

// @desc    Get my donations (as donor)
// @route   GET /api/donations/my-donations
// @access  Private
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate('claimedBy', 'name organizationName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });

  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get donations'
    });
  }
};

// @desc    Get claimed donations (as NGO)
// @route   GET /api/donations/my-claims
// @access  Private
exports.getMyClaims = async (req, res) => {
  try {
    const donations = await Donation.find({ claimedBy: req.user.id })
      .populate('donor', 'name organizationName phoneNumber')
      .sort({ claimedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations
    });

  } catch (error) {
    console.error('Get my claims error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get claims'
    });
  }
};