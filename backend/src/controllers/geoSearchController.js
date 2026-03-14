const User = require('../models/User');

/**
 * @desc    Search for NGOs near a given lat/lng or city
 * @route   GET /api/geo/ngos
 * @access  Private (any role)
 * @query   lat, lng, radius (km, default 20), city, search, page, limit
 */
exports.searchNGOs = async (req, res) => {
  try {
    const { lat, lng, radius = 20, city, search, page = 1, limit = 20 } = req.query;

    let filter = { role: 'ngo' };

    // Geo-radius search (if coordinates given)
    if (lat && lng) {
      const radiusInMeters = parseFloat(radius) * 1000;
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters
        }
      };
    } else if (city) {
      // Fallback: city-based text filter
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    const ngos = await User.find(filter)
      .select([
        'name', 'organizationName', 'ngoType', 'beneficiaryTypes',
        'dailyBeneficiaries', 'hasPickupVehicle', 'pickupRadius',
        'hasRefrigeration', 'storageCapacityKg', 'preferredFoodTypes',
        'address', 'location', 'phoneNumber', 'email', 'website',
        'organizationDescription', 'isVerified', 'foundedYear',
        'profileImage', 'createdAt'
      ].join(' '))
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: ngos.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: ngos
    });
  } catch (error) {
    console.error('NGO search error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to search NGOs' });
  }
};

/**
 * @desc    Search for restaurants/caterers near a lat/lng
 * @route   GET /api/geo/restaurants
 * @access  Private (any role)
 * @query   lat, lng, radius (km), city, search, cuisineType, listingType, page, limit
 */
exports.searchRestaurants = async (req, res) => {
  try {
    const {
      lat, lng, radius = 10, city, search,
      cuisineType, page = 1, limit = 20
    } = req.query;

    let filter = { role: 'restaurant' };

    if (lat && lng) {
      const radiusInMeters = parseFloat(radius) * 1000;
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters
        }
      };
    } else if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (cuisineType) {
      filter.cuisineTypes = cuisineType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);

    const restaurants = await User.find(filter)
      .select([
        'name', 'organizationName', 'organizationType', 'cuisineTypes',
        'seatingCapacity', 'dailySurplusCapacity', 'operatingHours',
        'donationMode', 'isHalalCertified', 'isVegetarianOnly',
        'fssaiLicense', 'address', 'location', 'phoneNumber', 'email',
        'website', 'organizationDescription', 'isVerified',
        'foundedYear', 'profileImage', 'createdAt'
      ].join(' '))
      .skip(skip)
      .limit(parseInt(limit));

    // For each restaurant, get their active listing count and discount listings
    const RestaurantFoodListing = require('../models/Restaurants/RestaurantFoodListing');
    const restaurantIds = restaurants.map(r => r._id);

    const [listingCounts, discountListings] = await Promise.all([
      RestaurantFoodListing.aggregate([
        { $match: { restaurant: { $in: restaurantIds }, status: 'active', isAvailable: true } },
        { $group: { _id: '$restaurant', count: { $sum: 1 } } }
      ]),
      RestaurantFoodListing.aggregate([
        {
          $match: {
            restaurant: { $in: restaurantIds },
            status: 'active',
            isAvailable: true,
            $or: [{ listingType: 'discount' }, { listingType: 'surplus' }, { discountPercentage: { $gt: 0 } }]
          }
        },
        { $group: { _id: '$restaurant', count: { $sum: 1 }, maxDiscount: { $max: '$discountPercentage' } } }
      ])
    ]);

    const countMap = {};
    listingCounts.forEach(l => { countMap[l._id.toString()] = l.count; });

    const discountMap = {};
    discountListings.forEach(l => {
      discountMap[l._id.toString()] = { count: l.count, maxDiscount: l.maxDiscount };
    });

    const result = restaurants.map(r => ({
      ...r.toObject(),
      activeListingsCount: countMap[r._id.toString()] || 0,
      discountListings: discountMap[r._id.toString()] || null
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
    console.error('Restaurant search error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to search restaurants' });
  }
};

/**
 * @desc    Get discount food listings from all restaurants (for users)
 * @route   GET /api/geo/discounts
 * @access  Private (any role)
 * @query   lat, lng, radius, city, category, page, limit
 */
exports.getDiscountListings = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const RestaurantFoodListing = require('../models/Restaurants/RestaurantFoodListing');

    const filter = {
      status: 'active',
      isAvailable: true,
      $or: [
        { listingType: 'discount' },
        { listingType: 'surplus' },
        { discountPercentage: { $gt: 0 } }
      ]
    };

    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await RestaurantFoodListing.countDocuments(filter);

    const listings = await RestaurantFoodListing.find(filter)
      .populate('restaurant', 'name organizationName address location phoneNumber cuisineTypes isVerified')
      .sort({ discountPercentage: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: listings
    });
  } catch (error) {
    console.error('Discount listings error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get discount listings' });
  }
};
