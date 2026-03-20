const app = require('../src/app');
const connectDB = require('../src/config/db');

let connectionPromise = null;

module.exports = async (req, res) => {
  try {
    if (!connectionPromise) {
      connectionPromise = connectDB();
    }

    await connectionPromise;
    return app(req, res);
  } catch (error) {
    console.error('Vercel function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server failed to initialize'
    });
  }
};
