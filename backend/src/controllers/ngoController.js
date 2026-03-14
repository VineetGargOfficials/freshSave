const User = require('../models/User');
const axios = require('axios');

// ── Geocode a city+state string to { lat, lng } using Google Geocoding API ────
async function geocodeAddress(addressStr) {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!API_KEY || !addressStr) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressStr)}&key=${API_KEY}`;
    const response = await axios.get(url, { timeout: 5000 });
    const results = response.data.results;
    if (results && results.length > 0) {
      const loc = results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
  } catch (err) {
    console.error(`[Geocode] Failed for "${addressStr}": ${err.message}`);
  }
  return null;
}

// ── Haversine distance in km ──────────────────────────────────────────────────
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => d * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// @desc    Get nearby NGOs by geocoding city+state of restaurant and all NGOs
// @route   GET /api/ngos/nearby
// @access  Public
exports.getNearbyNGOs = async (req, res) => {
  try {
    const { city, state, radius = 10, type } = req.query;
    const radiusInKm = parseFloat(radius);

    // ── 1. Geocode the restaurant's city + state ──────────────────────────────
    let restaurantCoords = null;
    if (city || state) {
      const addressStr = [city, state, 'India'].filter(Boolean).join(', ');
      restaurantCoords = await geocodeAddress(addressStr);
    }

    // ── 2. Fetch ALL registered NGOs from DB ──────────────────────────────────
    const dbQuery = { role: 'ngo' };
    if (type && type !== 'all') {
      dbQuery.ngoType = type;
    }

    const registeredNGOs = await User.find(dbQuery)
      .select('-password -resetPasswordToken -verificationToken')
      .lean();

    // ── 3. Geocode each NGO's city+state and calculate distance ───────────────
    const ngosWithDistance = await Promise.all(registeredNGOs.map(async (ngo) => {
      const ngoCity  = ngo.address?.city  || '';
      const ngoState = ngo.address?.state || '';
      const ngoAddressStr = [ngoCity, ngoState, 'India'].filter(Boolean).join(', ');

      let distance = null;

      if (restaurantCoords && ngoAddressStr.trim()) {
        // Geocode this NGO's address
        const ngoCoords = await geocodeAddress(ngoAddressStr);

        if (ngoCoords) {
          distance = calculateDistance(
            restaurantCoords.lat, restaurantCoords.lng,
            ngoCoords.lat, ngoCoords.lng
          );
          distance = Math.round(distance * 10) / 10; // 1 decimal place
        }
      }

      return {
        ...ngo,
        id: ngo._id,
        source: 'registered',
        distance
      };
    }));

    // ── 4. Filter by radius if we have the restaurant's location ──────────────
    let allNGOs;
    if (restaurantCoords) {
      allNGOs = ngosWithDistance
        .filter(ngo => ngo.distance !== null && ngo.distance <= radiusInKm)
        .sort((a, b) => a.distance - b.distance);
    } else {
      // No restaurant location: return ALL ngos sorted by name
      allNGOs = ngosWithDistance.sort((a, b) =>
        (a.organizationName || '').localeCompare(b.organizationName || '')
      );
    }

    res.status(200).json({
      success: true,
      count: allNGOs.length,
      data: allNGOs
    });

  } catch (error) {
    console.error('Get nearby NGOs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get nearby NGOs'
    });
  }
};


// @desc    Get place details (legacy stub)
// @route   GET /api/ngos/google/:placeId
// @access  Public
exports.getGooglePlaceDetails = async (req, res) => {
  return res.status(404).json({ success: false, message: 'Google Places not configured' });
};

// @desc    Get all NGOs (with optional filters)
// @route   GET /api/ngos
// @access  Public
exports.getAllNGOs = async (req, res) => {
  try {
    const { type, city, verified } = req.query;

    let query = { role: 'ngo' };

    if (type) query.ngoType = type;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (verified) query.isVerified = verified === 'true';

    const ngos = await User.find(query)
      .select('-password -resetPasswordToken -verificationToken')
      .sort({ verified: -1, createdAt: -1 });

    const ngosWithSource = ngos.map(ngo => ({
      ...ngo.toObject(),
      source: 'registered'
    }));

    res.status(200).json({
      success: true,
      count: ngosWithSource.length,
      data: ngosWithSource
    });

  } catch (error) {
    console.error('Get all NGOs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get NGOs'
    });
  }
};

// @desc    Get single NGO details
// @route   GET /api/ngos/:id
// @access  Public
exports.getNGOById = async (req, res) => {
  try {
    const ngo = await User.findOne({
      _id: req.params.id,
      role: 'ngo'
    }).select('-password -resetPasswordToken -verificationToken');

    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: 'NGO not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...ngo.toObject(),
        source: 'registered'
      }
    });

  } catch (error) {
    console.error('Get NGO error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get NGO'
    });
  }
};

// @desc    Update NGO profile (with location)
// @route   PUT /api/ngos/profile
// @access  Private (NGO only)
exports.updateNGOProfile = async (req, res) => {
  try {
    if (req.user.role !== 'ngo') {
      return res.status(403).json({
        success: false,
        message: 'Only NGOs can update this profile'
      });
    }

    const {
      organizationName,
      organizationType,
      organizationDescription,
      phoneNumber,
      address,
      latitude,
      longitude,
      servingCapacity,
      operatingHours
    } = req.body;

    const updateData = {
      organizationName,
      organizationType,
      organizationDescription,
      phoneNumber,
      address,
      servingCapacity,
      operatingHours
    };

    if (latitude && longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const ngo = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: ngo
    });

  } catch (error) {
    console.error('Update NGO profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

// Helper function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}


