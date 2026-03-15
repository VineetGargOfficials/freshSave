const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/nearby', ngoController.getNearbyNGOs);
router.get('/google/:placeId', ngoController.getGooglePlaceDetails);
router.get('/', ngoController.getAllNGOs);
router.get('/:id', ngoController.getNGOById);


// Protected routes
router.put('/profile', protect, ngoController.updateNGOProfile);

module.exports = router;
