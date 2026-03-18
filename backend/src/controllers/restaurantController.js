const RestaurantFoodListing = require('../models/Restaurants/RestaurantFoodListing');
const FoodItem = require('../models/IndividualUsers/FoodItem');
const User = require('../models/User');
const Claim = require('../models/Claim');
const { recomputeUserBadges } = require('../services/badgeService');

const ALLOWED_LISTING_TYPES = ['donation', 'discount'];

const generateCouponCode = (name = '') => {
  const prefix = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4)
    .padEnd(4, 'F');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${randomPart}`;
};

const prepareListingPayload = (payload = {}, existingListing = null) => {
  const listingType = payload.listingType || existingListing?.listingType || 'donation';

  if (!ALLOWED_LISTING_TYPES.includes(listingType)) {
    return { error: 'Listing type must be either donation or discount.' };
  }

  const normalized = {
    ...payload,
    listingType
  };

  if (listingType === 'donation') {
    normalized.price = 0;
    normalized.discountPercentage = 0;
    normalized.couponCode = null;
    return { data: normalized };
  }

  const price = Number(normalized.price ?? existingListing?.price ?? 0);
  const discountPercentage = Number(
    normalized.discountPercentage ?? existingListing?.discountPercentage ?? 0
  );

  if (!Number.isFinite(price) || price <= 0) {
    return { error: 'Discounted listings must have a price greater than 0.' };
  }

  if (!Number.isFinite(discountPercentage) || discountPercentage <= 0 || discountPercentage > 100) {
    return { error: 'Discounted listings must have a valid discount percentage greater than 0.' };
  }

  normalized.price = price;
  normalized.discountPercentage = discountPercentage;
  normalized.unit = 'portions';
  normalized.currency = 'INR';
  normalized.couponCode =
    normalized.couponCode || existingListing?.couponCode || generateCouponCode(normalized.name || existingListing?.name);

  return { data: normalized };
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC / USER-FACING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Browse all active food listings (from all restaurants)
 * @route   GET /api/restaurants/listings
 * @access  Private (any logged-in user)
 * @query   category, listingType, search, restaurantId, page, limit
 */
exports.browseListings = async (req, res) => {
  try {
    const {
      category,
      listingType,
      search,
      restaurantId,
      page = 1,
      limit = 20
    } = req.query;

    // Base filter: only active & available listings
    const filter = { status: 'active', isAvailable: true };

    if (category) filter.category = category;
    if (listingType) filter.listingType = listingType;
    if (restaurantId) filter.restaurant = restaurantId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await RestaurantFoodListing.countDocuments(filter);

    const listings = await RestaurantFoodListing.find(filter)
      .populate('restaurant', 'name organizationName address profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Optional: Filter out expired items in memory if pre-save hasn't caught them
    const validListings = listings.filter(l => {
      if (l.expiryDate && new Date(l.expiryDate) < new Date()) return false;
      return true;
    });

    res.status(200).json({
      success: true,
      count: validListings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: validListings
    });
  } catch (error) {
    console.error('Browse listings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch listings'
    });
  }
};

/**
 * @desc    Get a single listing by ID
 * @route   GET /api/restaurants/listings/:id
 * @access  Private
 */
exports.getListing = async (req, res) => {
  try {
    const listing = await RestaurantFoodListing.findById(req.params.id)
      .populate('restaurant', 'name organizationName address phoneNumber profileImage');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get listing' });
  }
};

/**
 * @desc    Get all restaurants (users with role='restaurant')
 * @route   GET /api/restaurants
 * @access  Private
 */
exports.getRestaurants = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const filter = { role: 'restaurant' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    const restaurants = await User.find(filter)
      .select('name organizationName address phoneNumber profileImage createdAt')
      .sort({ organizationName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // For each restaurant, attach a live count of active listings
    const restaurantIds = restaurants.map(r => r._id);
    const listingCounts = await RestaurantFoodListing.aggregate([
      { $match: { restaurant: { $in: restaurantIds }, status: 'active', isAvailable: true } },
      { $group: { _id: '$restaurant', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    listingCounts.forEach(l => { countMap[l._id.toString()] = l.count; });

    const result = restaurants.map(r => ({
      ...r.toObject(),
      activeListingsCount: countMap[r._id.toString()] || 0
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: result
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch restaurants' });
  }
};

/**
 * @desc    Get all listings from a specific restaurant
 * @route   GET /api/restaurants/:restaurantId/listings
 * @access  Private
 */
exports.getRestaurantListings = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, listingType, status } = req.query;

    const filter = { restaurant: restaurantId };
    if (category) filter.category = category;
    if (listingType) filter.listingType = listingType;

    // If not the owner, only show active listings
    const isOwner = req.user.id === restaurantId || req.user.role === 'admin';
    if (!isOwner) {
      filter.status = 'active';
      filter.isAvailable = true;
      filter.listingType = 'donation';
    } else if (status) {
      filter.status = status;
    }

    const listings = await RestaurantFoodListing.find(filter)
      .populate('restaurant', 'name organizationName address')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Get restaurant listings error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch restaurant listings' });
  }
};

/**
 * @desc    Get all active food listings from restaurants connected to the NGO
 * @route   GET /api/restaurants/connected/listings
 * @access  Private (NGO only)
 */
exports.getConnectedListings = async (req, res) => {
  try {
    const Connection = require('../models/Connection');
    const RestaurantFoodListing = require('../models/Restaurants/RestaurantFoodListing');
    const IndividualDonation = require('../models/IndividualUsers/Donation');

    if (req.user.role !== 'ngo') {
      console.log(`[getConnectedListings] Access denied: user role is ${req.user.role}`);
      return res.status(403).json({ success: false, message: 'Only NGOs can access connected partner listings' });
    }

    console.log(`[getConnectedListings] Fetching connections for NGO: ${req.user.id}`);

    // 1. Find all accepted connections for this NGO
    const connections = await Connection.find({
      ngo: req.user.id,
      status: 'accepted'
    });

    console.log(`[getConnectedListings] Found ${connections.length} accepted connections`);

    if (!connections || connections.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No connected partners found',
        data: []
      });
    }

    const connectedRestaurantIds = connections
      .filter(c => c.requesterRole === 'restaurant')
      .map(c => c.requester);
    
    const connectedUserIds = connections
      .filter(c => c.requesterRole === 'user')
      .map(c => c.requester);

    console.log(`[getConnectedListings] Connected: ${connectedRestaurantIds.length} restaurants, ${connectedUserIds.length} users`);

    // 2. Fetch active listings from restaurants
    const restaurantListings = await RestaurantFoodListing.find({
      restaurant: { $in: connectedRestaurantIds },
      listingType: 'donation',
      status: 'active',
      isAvailable: true
    })
    .populate('restaurant', 'name organizationName address profileImage location phoneNumber')
    .lean();

    console.log(`[getConnectedListings] Found ${restaurantListings.length} restaurant listings`);

    // 3. Fetch active donations from individual users
    const userDonations = await IndividualDonation.find({
      donor: { $in: connectedUserIds },
      status: 'available'
    })
    .populate('donor', 'name address profileImage phoneNumber location')
    .lean();

    console.log(`[getConnectedListings] Found ${userDonations.length} user donations`);

    // 4. Combine and format both
    const formattedRestaurantListings = restaurantListings.map(l => ({
      ...l,
      _id: l._id,
      name: l.name,
      description: l.description,
      quantity: `${l.quantityAvailable} ${l.unit}`,
      quantityAvailable: l.quantityAvailable,
      unit: l.unit,
      expiryDate: l.expiryDate,
      partner: l.restaurant,
      partnerType: 'restaurant',
      source: 'listing'
    }));

    const formattedUserDonations = userDonations.map(d => ({
      ...d,
      _id: d._id,
      name: d.foodDescription.split('\n')[0].substring(0, 50), // Use first line of description as name
      description: d.foodDescription,
      quantity: d.quantity,
      quantityAvailable: d.quantityAvailable || d.servings || 1,
      unit: d.unit || 'portions',
      expiryDate: d.availableUntil,
      partner: d.donor,
      partnerType: 'individual',
      source: 'donation'
    }));

    const allListings = [...formattedRestaurantListings, ...formattedUserDonations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`[getConnectedListings] Total results: ${allListings.length}`);
    allListings.forEach(l => {
      console.log(` - ${l.partnerType}: ${l.name} from ${l.partnerType === 'restaurant' ? l.partner.organizationName : l.partner.name}`);
    });

    res.status(200).json({
      success: true,
      count: allListings.length,
      data: allListings
    });
  } catch (error) {
    console.error('Get connected listings error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch connected listings' });
  }
};

/**
 * @desc    User adds a restaurant food item directly to their own fridge/food list
 * @route   POST /api/restaurants/listings/:id/add-to-fridge
 * @access  Private (any user)
 */
exports.addListingToFridge = async (req, res) => {
  try {
    const listing = await RestaurantFoodListing.findById(req.params.id).populate('restaurant', 'name organizationName');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    if (!listing.isAvailable || listing.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This item is no longer available' });
    }

    // Create a FoodItem in the user's fridge from the listing details
    const { quantity, storageLocation = 'fridge', notes, fulfillmentMethod = 'pickup', deliveryAddress } = req.body;

    // Default expiry: listing's expiry date or 3 days from now
    const expiryDate = listing.expiryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    // Map restaurant category → FoodItem category
    const categoryMap = {
      'Appetizers': 'Other',
      'Main Course': 'Other',
      'Desserts': 'Snacks',
      'Beverages': 'Beverages',
      'Snacks': 'Snacks',
      'Salads': 'Vegetables',
      'Soups': 'Other',
      'Breakfast': 'Other',
      'Sides': 'Other',
      'Other': 'Other'
    };

    const partnerName = listing.restaurant?.organizationName || listing.restaurant?.name || 'Restaurant';

    // Parse numeric quantity if claiming partially
    const claimQtyNum = parseInt(quantity) || 1;
    
    // Check if requested quantity is available
    if (listing.quantityAvailable < claimQtyNum) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${listing.quantityAvailable} ${listing.unit} available for this item.` 
      });
    }

    const foodItem = await FoodItem.create({
      user: req.user.id,
      name: listing.name,
      quantity: quantity || `${claimQtyNum} ${listing.unit}`,
      category: categoryMap[listing.category] || 'Other',
      expiryDate,
      storageLocation,
      notes: notes || `Added from ${partnerName} restaurant listing: ${listing.name}`,
      addedVia: 'manual',
      nutritionInfo: listing.nutritionInfo || {}
    });

    // Create a Claim record for the restaurant to see (for NGOs)
    if (req.user.role === 'ngo') {
      await Claim.create({
        listing: listing._id,
        listingModel: 'RestaurantFoodListing',
        ngo: req.user.id,
        quantity: claimQtyNum,
        unit: listing.unit,
        status: 'claimed',
        fulfillmentMethod,
        notes: notes || `Fulfillment: ${fulfillmentMethod}${deliveryAddress ? ` to ${deliveryAddress}` : ''}`
      });
      await recomputeUserBadges(req.user.id);
    }


    
    // For NGOs, handle partial or full claim
    if (req.user.role === 'ngo') {
      listing.quantityAvailable -= claimQtyNum;
      if (listing.quantityAvailable <= 0) {
        listing.isAvailable = false;
        listing.status = 'sold_out';
      }
    } else if (listing.quantityAvailable > 0) {
      // Regular users take just one portion/unit
      listing.quantityAvailable -= 1;
      if (listing.quantityAvailable <= 0) {
        listing.isAvailable = false;
        listing.status = 'sold_out';
      }
    }
    
    await listing.save();

    res.status(201).json({
      success: true,
      message: `"${listing.name}" has been added to your collection!`,
      data: {
        foodItem,
        listing: {
          id: listing._id,
          name: listing.name,
          remainingQuantity: listing.quantityAvailable,
          unit: listing.unit
        }
      }
    });
  } catch (error) {
    console.error('Add listing to fridge error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to add item to fridge' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESTAURANT-ONLY (manage their own listings)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @desc    Restaurant creates a new food listing
 * @route   POST /api/restaurants/listings
 * @access  Private (restaurant role only)
 */
exports.createListing = async (req, res) => {
  try {
    const prepared = prepareListingPayload(req.body);
    if (prepared.error) {
      return res.status(400).json({ success: false, message: prepared.error });
    }

    const listing = await RestaurantFoodListing.create({
      ...prepared.data,
      restaurant: req.user.id
    });
    await recomputeUserBadges(req.user.id);

    res.status(201).json({
      success: true,
      message: 'Food listing created successfully',
      data: listing
    });
  } catch (error) {
    console.error('Create listing error:', error);

    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({ success: false, message: error.message || 'Failed to create listing' });
  }
};

/**
 * @desc    Restaurant updates one of their listings
 * @route   PUT /api/restaurants/listings/:id
 * @access  Private (restaurant role, owner only)
 */
exports.updateListing = async (req, res) => {
  try {
    let listing = await RestaurantFoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Only the owning restaurant or admin can update
    if (listing.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    const prepared = prepareListingPayload(req.body, listing);
    if (prepared.error) {
      return res.status(400).json({ success: false, message: prepared.error });
    }

    listing = await RestaurantFoodListing.findByIdAndUpdate(
      req.params.id,
      prepared.data,
      { new: true, runValidators: true }
    );
    await recomputeUserBadges(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    console.error('Update listing error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    res.status(500).json({ success: false, message: error.message || 'Failed to update listing' });
  }
};

/**
 * @desc    Restaurant deletes (removes) one of their listings
 * @route   DELETE /api/restaurants/listings/:id
 * @access  Private (restaurant role, owner only)
 */
exports.deleteListing = async (req, res) => {
  try {
    const listing = await RestaurantFoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await listing.deleteOne();
    await recomputeUserBadges(req.user.id);

    res.status(200).json({ success: true, message: 'Listing removed successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete listing' });
  }
};

/**
 * @desc    Toggle availability of a listing (quick on/off)
 * @route   PATCH /api/restaurants/listings/:id/toggle
 * @access  Private (restaurant role, owner only)
 */
exports.toggleAvailability = async (req, res) => {
  try {
    const listing = await RestaurantFoodListing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.restaurant.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    listing.isAvailable = !listing.isAvailable;
    listing.status = listing.isAvailable ? 'active' : 'removed';
    await listing.save();

    res.status(200).json({
      success: true,
      message: `Listing is now ${listing.isAvailable ? 'available' : 'unavailable'}`,
      data: { isAvailable: listing.isAvailable, status: listing.status }
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle availability' });
  }
};

/**
 * @desc    Get restaurant's own listing stats
 * @route   GET /api/restaurants/my/stats
 * @access  Private (restaurant role)
 */
exports.getMyStats = async (req, res) => {
  try {
    const listings = await RestaurantFoodListing.find({ restaurant: req.user.id });

    const stats = {
      total: listings.length,
      active: listings.filter(l => l.status === 'active').length,
      soldOut: listings.filter(l => l.status === 'sold_out').length,
      expired: listings.filter(l => l.status === 'expired').length,
      removed: listings.filter(l => l.status === 'removed').length,
      byListingType: {},
      byCategory: {},
      totalReservations: listings.reduce((sum, l) => sum + (l.totalReservations || 0), 0)
    };

    listings.forEach(l => {
      stats.byListingType[l.listingType] = (stats.byListingType[l.listingType] || 0) + 1;
      stats.byCategory[l.category] = (stats.byCategory[l.category] || 0) + 1;
    });

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Get restaurant stats error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get stats' });
  }
};

/**
 * @desc    Get all claims on this restaurant's listings
 * @route   GET /api/restaurants/my/claims
 * @access  Private (restaurant role)
 */
exports.getRestaurantClaims = async (req, res) => {
  try {
    const { listingId } = req.query;
    
    // Find all listings belonging to this restaurant
    const myListingIds = await RestaurantFoodListing.find({ restaurant: req.user.id }).distinct('_id');
    
    let filter = { 
      listing: { $in: myListingIds },
      listingModel: 'RestaurantFoodListing'
    };
    
    if (listingId) {
      filter.listing = listingId;
    }

    const claims = await Claim.find(filter)
      .populate('ngo', 'name organizationName phoneNumber email profileImage')
      .populate('listing', 'name quantityAvailable unit status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    console.error('Get restaurant claims error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch claims' });
  }
};

