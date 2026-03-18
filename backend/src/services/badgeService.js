const User = require('../models/User');
const Donation = require('../models/IndividualUsers/Donation');
const FoodItem = require('../models/IndividualUsers/FoodItem');
const Connection = require('../models/Connection');
const Claim = require('../models/Claim');
const RestaurantFoodListing = require('../models/Restaurants/RestaurantFoodListing');

const BADGE_DEFINITIONS = {
  user: [
    {
      badgeId: 'donation_badge',
      title: 'Donation Badge',
      description: 'Created 3 food donations for the community.',
      category: 'Contribution',
      color: 'emerald',
      icon: 'HeartHandshake',
      check: ({ donationCount }) => donationCount >= 3
    },
    {
      badgeId: 'network_builder',
      title: 'Network Builder',
      description: 'Built 3 accepted NGO connections.',
      category: 'Connection',
      color: 'sky',
      icon: 'Handshake',
      check: ({ acceptedConnections }) => acceptedConnections >= 3
    },
    {
      badgeId: 'steady_helper',
      title: 'Steady Helper',
      description: 'Shared 10 donations with nearby communities.',
      category: 'Consistency',
      color: 'amber',
      icon: 'BadgeCheck',
      check: ({ donationCount }) => donationCount >= 10
    },
    {
      badgeId: 'smart_saver',
      title: 'Smart Saver',
      description: 'Consumed 15 items before they went to waste.',
      category: 'Waste Reduction',
      color: 'violet',
      icon: 'Leaf',
      check: ({ consumedCount }) => consumedCount >= 15
    },
    {
      badgeId: 'community_hero',
      title: 'Community Hero',
      description: 'Reached 25 successful donation listings.',
      category: 'Impact',
      color: 'rose',
      icon: 'Award',
      check: ({ donationCount }) => donationCount >= 25
    }
  ],
  restaurant: [
    {
      badgeId: 'donation_badge',
      title: 'Donation Badge',
      description: 'Published 20 donation listings for NGOs.',
      category: 'Contribution',
      color: 'emerald',
      icon: 'HeartHandshake',
      check: ({ donationListings }) => donationListings >= 20
    },
    {
      badgeId: 'network_builder',
      title: 'Network Builder',
      description: 'Built 3 accepted NGO partnerships.',
      category: 'Connection',
      color: 'sky',
      icon: 'Handshake',
      check: ({ acceptedConnections }) => acceptedConnections >= 3
    },
    {
      badgeId: 'offers_architect',
      title: 'Offers Architect',
      description: 'Created 5 discounted food offers for local users.',
      category: 'Offers',
      color: 'violet',
      icon: 'TicketPercent',
      check: ({ discountListings }) => discountListings >= 5
    },
    {
      badgeId: 'steady_helper',
      title: 'Steady Helper',
      description: 'Maintained 30 total food listings.',
      category: 'Consistency',
      color: 'amber',
      icon: 'BadgeCheck',
      check: ({ totalListings }) => totalListings >= 30
    },
    {
      badgeId: 'community_hero',
      title: 'Community Hero',
      description: 'Reached 50 total food listings across donation and discount campaigns.',
      category: 'Impact',
      color: 'rose',
      icon: 'Award',
      check: ({ totalListings }) => totalListings >= 50
    }
  ],
  ngo: [
    {
      badgeId: 'donation_badge',
      title: 'Donation Badge',
      description: 'Claimed 5 food donations for distribution.',
      category: 'Contribution',
      color: 'emerald',
      icon: 'HeartHandshake',
      check: ({ claimCount }) => claimCount >= 5
    },
    {
      badgeId: 'network_builder',
      title: 'Network Builder',
      description: 'Built 3 accepted donor connections.',
      category: 'Connection',
      color: 'sky',
      icon: 'Handshake',
      check: ({ acceptedConnections }) => acceptedConnections >= 3
    },
    {
      badgeId: 'rescue_runner',
      title: 'Rescue Runner',
      description: 'Claimed 10 food rescue opportunities.',
      category: 'Rescue',
      color: 'amber',
      icon: 'Truck',
      check: ({ claimCount }) => claimCount >= 10
    },
    {
      badgeId: 'steady_helper',
      title: 'Steady Helper',
      description: 'Collected 15 partner or community food claims.',
      category: 'Consistency',
      color: 'violet',
      icon: 'BadgeCheck',
      check: ({ claimCount }) => claimCount >= 15
    },
    {
      badgeId: 'community_hero',
      title: 'Community Hero',
      description: 'Completed 30 food rescue claims for beneficiaries.',
      category: 'Impact',
      color: 'rose',
      icon: 'Award',
      check: ({ claimCount }) => claimCount >= 30
    }
  ]
};

const getMetricsForUser = async (user) => {
  const acceptedConnections = await Connection.countDocuments({
    status: 'accepted',
    $or: [{ requester: user._id }, { ngo: user._id }]
  });

  if (user.role === 'user') {
    const [donationCount, consumedCount] = await Promise.all([
      Donation.countDocuments({ donor: user._id }),
      FoodItem.countDocuments({ user: user._id, consumed: true })
    ]);

    return { donationCount, consumedCount, acceptedConnections };
  }

  if (user.role === 'restaurant') {
    const [donationListings, discountListings, totalListings] = await Promise.all([
      RestaurantFoodListing.countDocuments({ restaurant: user._id, listingType: 'donation' }),
      RestaurantFoodListing.countDocuments({ restaurant: user._id, listingType: 'discount' }),
      RestaurantFoodListing.countDocuments({ restaurant: user._id })
    ]);

    return { donationListings, discountListings, totalListings, acceptedConnections };
  }

  if (user.role === 'ngo') {
    const claimCount = await Claim.countDocuments({ ngo: user._id });
    return { claimCount, acceptedConnections };
  }

  return { acceptedConnections };
};

const recomputeUserBadges = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const definitions = BADGE_DEFINITIONS[user.role] || [];
  const metrics = await getMetricsForUser(user);

  const earnedBadges = definitions
    .filter((badge) => badge.check(metrics))
    .map((badge) => ({
      badgeId: badge.badgeId,
      title: badge.title,
      description: badge.description,
      category: badge.category,
      color: badge.color,
      icon: badge.icon,
      awardedAt: new Date()
    }));

  user.badges = earnedBadges;
  await user.save();
  return user.badges;
};

module.exports = {
  BADGE_DEFINITIONS,
  recomputeUserBadges
};
