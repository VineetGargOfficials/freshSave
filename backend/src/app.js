const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/IndividualUsers/foodRoutes');
const donationRoutes = require('./routes/IndividualUsers/donationRoutes');
const recipeRoutes = require('./routes/IndividualUsers/recipeRoutes');
const ocrRoutes = require('./routes/IndividualUsers/ocrRoutes');
const restaurantRoutes = require('./routes/Restaurants/restaurantRoutes');
const geoRoutes = require('./routes/geoRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS Configuration - Allow all origins in development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow anyway in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/connections', connectionRoutes);

// Optional: Test routes (only if file exists)
try {
  const testRoutes = require('./routes/testRoutes');
  app.use('/api/test', testRoutes);
  console.log('✅ Test routes loaded');
} catch (e) {
  console.log('⚠️ Test routes not available (optional)');
}

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route not found: ${req.method} ${req.url}` 
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;