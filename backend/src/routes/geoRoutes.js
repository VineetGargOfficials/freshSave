const express = require('express');
const { searchNGOs, searchRestaurants, getDiscountListings } = require('../controllers/geoSearchController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/geo/ngos?lat=&lng=&radius=&city=&search=
router.get('/ngos', searchNGOs);

// GET /api/geo/restaurants?lat=&lng=&radius=&city=&search=&cuisineType=
router.get('/restaurants', searchRestaurants);

// GET /api/geo/discounts?category=&search=
router.get('/discounts', getDiscountListings);

module.exports = router;
