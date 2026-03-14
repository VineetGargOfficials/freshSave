const express = require('express');
const {
  // Public / user-facing
  browseListings,
  getListing,
  getRestaurants,
  getRestaurantListings,
  addListingToFridge,

  // Restaurant management
  createListing,
  updateListing,
  deleteListing,
  toggleAvailability,
  getMyStats
} = require('../../controllers/restaurantController');

const { protect, authorize } = require('../../middleware/auth');

const router = express.Router();

// ─── All routes require login ────────────────────────────────────────────────
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTANT: All STATIC paths must come BEFORE dynamic /:param paths
// to prevent Express matching e.g. "my" or "listings" as a :restaurantId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/restaurants
 * List all restaurants
 */
router.get('/', getRestaurants);

/**
 * GET /api/restaurants/listings
 * Browse all active food listings across all restaurants
 * Query: ?category=&listingType=&search=&restaurantId=&page=&limit=
 */
router.get('/listings', browseListings);

/**
 * POST /api/restaurants/listings
 * Restaurant creates a new food listing (restaurant role only)
 */
router.post('/listings', authorize('restaurant', 'admin'), createListing);

/**
 * GET /api/restaurants/listings/:id
 * Get a single listing's details
 */
router.get('/listings/:id', getListing);

/**
 * PUT /api/restaurants/listings/:id
 * Restaurant updates a listing
 */
router.put('/listings/:id', authorize('restaurant', 'admin'), updateListing);

/**
 * DELETE /api/restaurants/listings/:id
 * Restaurant removes a listing
 */
router.delete('/listings/:id', authorize('restaurant', 'admin'), deleteListing);

/**
 * PATCH /api/restaurants/listings/:id/toggle
 * Toggle a listing's availability on/off (restaurant role only)
 */
router.patch('/listings/:id/toggle', authorize('restaurant', 'admin'), toggleAvailability);

/**
 * POST /api/restaurants/listings/:id/add-to-fridge
 * Any logged-in user adds a restaurant item to their fridge
 */
router.post('/listings/:id/add-to-fridge', addListingToFridge);

/**
 * GET /api/restaurants/my/stats
 * Restaurant sees their own dashboard stats (MUST be before /:restaurantId routes)
 */
router.get('/my/stats', authorize('restaurant', 'admin'), getMyStats);

// ─── Dynamic param routes last ────────────────────────────────────────────────

/**
 * GET /api/restaurants/:restaurantId/listings
 * Get all listings from a specific restaurant
 * Query: ?category=&listingType=&status=
 */
router.get('/:restaurantId/listings', getRestaurantListings);

module.exports = router;
