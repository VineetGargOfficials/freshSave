const FoodItem = require('../models/IndividualUsers/FoodItem');
const User = require('../models/User');
const emailService = require('./emailService');

exports.checkExpiringItems = async () => {
  try {
    const users = await User.find({
      'preferences.notifications.email': true
    });

    for (const user of users) {
      const expiryThreshold = user.preferences?.expiryReminder || 3;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + expiryThreshold);

      const expiringItems = await FoodItem.find({
        user: user._id,
        consumed: false,
        alertSent: false,
        expiryDate: {
          $gte: new Date(),
          $lte: targetDate
        },
        status: { $in: ['fresh', 'warning', 'urgent'] }
      });

      if (!expiringItems.length) {
        continue;
      }

      const itemsWithDays = expiringItems.map((item) => ({
        name: item.name,
        daysUntilExpiry: Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      }));

      await emailService.sendExpiryNotification(user.email, itemsWithDays);
      await FoodItem.updateMany(
        { _id: { $in: expiringItems.map((item) => item._id) } },
        { $set: { alertSent: true } }
      );
    }
  } catch (error) {
    console.error('Error checking expiring items:', error);
  }
};

exports.updateFoodStatuses = async () => {
  try {
    const allItems = await FoodItem.find({ consumed: false });

    let updatedCount = 0;
    for (const item of allItems) {
      const oldStatus = item.status;
      item.updateStatus();

      if (oldStatus !== item.status) {
        await item.save();
        updatedCount++;
      }
    }

    console.log(`Updated status for ${updatedCount} items`);
  } catch (error) {
    console.error('Error updating food statuses:', error);
  }
};

exports.sendPushNotification = async (userId, message) => {
  console.log(`Push notification for user ${userId}: ${message}`);
};
