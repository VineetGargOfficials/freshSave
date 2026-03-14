const { Client } = require("@googlemaps/google-maps-services-js");
const axios = require('axios');

const client = new Client({});
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Search for NGOs, orphanages, old age homes near a location
exports.searchNearbyNGOs = async (latitude, longitude, radius = 10000, type = null) => {
  try {
    if (!API_KEY) {
      console.warn('⚠️ Google Places API key not configured');
      return [];
    }

    const location = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
    
    // Keywords to search for different types of NGOs
    const searchKeywords = {
      orphanage: ['orphanage', 'children home', 'child care center'],
      old_age_home: ['old age home', 'senior citizen home', 'elderly care'],
      food_bank: ['food bank', 'food pantry', 'hunger relief'],
      homeless_shelter: ['homeless shelter', 'night shelter', 'rescue mission'],
      community_kitchen: ['community kitchen', 'soup kitchen', 'langar'],
      ngo: ['ngo', 'non profit', 'charity', 'welfare organization', 'social service']
    };

    const keywords = type && searchKeywords[type] 
      ? searchKeywords[type] 
      : searchKeywords.ngo;

    const allPlaces = [];

    // Search for each keyword
    for (const keyword of keywords) {
      try {
        const response = await client.placesNearby({
          params: {
            location,
            radius,
            keyword,
            key: API_KEY,
          },
          timeout: 5000,
        });

        if (response.data.results) {
          allPlaces.push(...response.data.results);
        }

        // Rate limiting - wait 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error searching for ${keyword}:`, error.message);
      }
    }

    // Remove duplicates based on place_id
    const uniquePlaces = Array.from(
      new Map(allPlaces.map(place => [place.place_id, place])).values()
    );

    // Transform to our format
    const ngos = uniquePlaces.map(place => ({
      id: place.place_id,
      source: 'google',
      name: place.name,
      organizationName: place.name,
      organizationType: detectOrganizationType(place),
      address: {
        fullAddress: place.vicinity,
        formatted_address: place.formatted_address
      },
      location: {
        type: 'Point',
        coordinates: [
          place.geometry.location.lng,
          place.geometry.location.lat
        ]
      },
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      isOpen: place.opening_hours?.open_now,
      photos: place.photos ? place.photos.map(photo => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) : [],
      businessStatus: place.business_status,
      verified: false,
      distance: calculateDistance(
        latitude,
        longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      )
    }));

    return ngos;

  } catch (error) {
    console.error('Google Places API error:', error.message);
    return [];
  }
};

// Get detailed information about a place
exports.getPlaceDetails = async (placeId) => {
  try {
    if (!API_KEY) {
      return null;
    }

    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          'name',
          'formatted_address',
          'formatted_phone_number',
          'opening_hours',
          'website',
          'rating',
          'user_ratings_total',
          'reviews',
          'geometry',
          'photos',
          'types'
        ],
        key: API_KEY,
      },
      timeout: 5000,
    });

    if (response.data.result) {
      const place = response.data.result;
      
      return {
        id: placeId,
        source: 'google',
        name: place.name,
        organizationName: place.name,
        address: {
          fullAddress: place.formatted_address
        },
        phoneNumber: place.formatted_phone_number,
        website: place.website,
        location: {
          type: 'Point',
          coordinates: [
            place.geometry.location.lng,
            place.geometry.location.lat
          ]
        },
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        openingHours: place.opening_hours,
        reviews: place.reviews || [],
        photos: place.photos || [],
        types: place.types || []
      };
    }

    return null;

  } catch (error) {
    console.error('Get place details error:', error.message);
    return null;
  }
};

// Get photo URL from photo reference
exports.getPhotoUrl = (photoReference, maxWidth = 400) => {
  if (!photoReference || !API_KEY) return null;
  
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
};

// Detect organization type from Google Place data
function detectOrganizationType(place) {
  const name = (place.name || '').toLowerCase();
  const types = (place.types || []).join(' ').toLowerCase();
  const vicinity = (place.vicinity || '').toLowerCase();
  
  const combined = `${name} ${types} ${vicinity}`;

  if (combined.includes('orphan') || combined.includes('children home') || combined.includes('child care')) {
    return 'orphanage';
  }
  if (combined.includes('old age') || combined.includes('senior citizen') || combined.includes('elderly')) {
    return 'old_age_home';
  }
  if (combined.includes('food bank') || combined.includes('food pantry')) {
    return 'food_bank';
  }
  if (combined.includes('shelter') || combined.includes('homeless')) {
    return 'homeless_shelter';
  }
  if (combined.includes('soup kitchen') || combined.includes('community kitchen') || combined.includes('langar')) {
    return 'community_kitchen';
  }
  if (combined.includes('animal') && combined.includes('shelter')) {
    return 'animal_shelter';
  }

  return 'other';
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = {
  searchNearbyNGOs: exports.searchNearbyNGOs,
  getPlaceDetails: exports.getPlaceDetails,
  getPhotoUrl: exports.getPhotoUrl
};
