const cron = require('node-cron');
const { checkExpiringItems, updateFoodStatuses } = require('../services/notificationService');

let started = false;

exports.startExpiryCheckerJob = () => {
  if (started) {
    return;
  }

  started = true;

  cron.schedule('0 8 * * *', async () => {
    await updateFoodStatuses();
    await checkExpiringItems();
  });
};
