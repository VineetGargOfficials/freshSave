const FoodItem = require('../models/FoodItem');
const User = require('../models/User');
const emailService = require('./emailService');

// Check for expiring items and send notifications
exports.checkExpiringItems = async () => {
  try {
    const users = await User.find({ 
      'preferences.notifications.email': true 
    });

    for (const user of users) {
      const expiryThreshold = user.preferences.expiryReminder || 3;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + expiryThreshold);

      const expiringItems = await FoodItem.find({
        user: user._id,
        consumed: false,
        expiryDate: { 
          $gte: new Date(), 
          $lte: targetDate 
        },
        status: { $in: ['fresh', 'warning', 'urgent'] }
      });

      if (expiringItems.length > 0) {
        const itemsWithDays = expiringItems.map(item => ({
          name: item.name,
          daysUntilExpiry: Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        }));

        await emailService.sendExpiryNotification(user.email, itemsWithDays);
        console.log(`📧 Sent expiry notification to ${user.email} for ${expiringItems.length} items`);
      }
    }
  } catch (error) {
    console.error('❌ Error checking expiring items:', error);
  }
};

// Update food item statuses
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
    
    console.log(`✅ Updated status for ${updatedCount} items`);
  } catch (error) {
    console.error('❌ Error updating food statuses:', error);
  }
};

// Send push notification (placeholder for future implementation)
exports.sendPushNotification = async (userId, message) => {
  // TODO: Implement push notifications using Firebase Cloud Messaging or similar
  console.log(`📱 Push notification for user ${userId}: ${message}`);
};