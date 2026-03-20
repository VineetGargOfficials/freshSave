require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { startExpiryCheckerJob } = require('./src/jobs/expiryCheckerJob');
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
startExpiryCheckerJob();

// Test email configuration (with better error handling)
(async () => {
  try {
    const emailService = require('./src/services/emailService');
    const isWorking = await emailService.testEmailConfig();
    
    if (isWorking) {
      console.log('✅ Email service is ready');
    } else {
      console.warn('⚠️ Email service has issues - check configuration');
    }
  } catch (error) {
    console.error('❌ Email service error:', error.message);
  }
})();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
