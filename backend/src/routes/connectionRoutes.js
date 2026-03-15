const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { protect, authorize } = require('../middleware/auth');

// Make sure users are authenticated for all properties
router.use(protect);

// 1. Fetch own connections (both as requester or NGO receiver)
router.get('/my', connectionController.getMyConnections);

// 2. Request a connection (only for Restaurants and Users to send to an NGO)
router.post('/request', authorize('restaurant', 'user'), connectionController.requestConnection);

// 3. Accept/Reject connection (NGOs or any authorized partner who is the target of the connect)
router.put('/:id/status', authorize('ngo', 'restaurant', 'admin'), connectionController.updateConnectionStatus);

module.exports = router;
