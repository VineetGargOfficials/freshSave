const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check results
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['user', 'restaurant', 'ngo', 'admin'])
    .withMessage('Invalid role'),
];

// Login validation
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Food item validation
exports.foodItemValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Food name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  
  body('expiryDate')
    .notEmpty()
    .withMessage('Expiry date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('category')
    .optional()
    .isIn(['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains', 'Beverages', 'Snacks', 'Condiments', 'Frozen', 'Other'])
    .withMessage('Invalid category'),
];

// Donation validation
exports.donationValidation = [
  body('restaurantName')
    .trim()
    .notEmpty()
    .withMessage('Restaurant/Organization name is required'),
  
  body('foodDescription')
    .trim()
    .notEmpty()
    .withMessage('Food description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required'),
  
  body('pickupLocation.address')
    .notEmpty()
    .withMessage('Pickup location is required'),
  
  body('availableUntil')
    .notEmpty()
    .withMessage('Available until date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
];

// ID parameter validation
exports.idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
];
