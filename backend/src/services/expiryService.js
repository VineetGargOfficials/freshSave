const expiryDatabase = require('../utils/expiryDatabase');

const categoryDefaults = {
  Fruits: 7,
  Vegetables: 5,
  Dairy: 7,
  Meat: 3,
  Grains: 30,
  Beverages: 14,
  Snacks: 30,
  Condiments: 180,
  Frozen: 60,
  Other: 14
};

const normalizeCategory = (category = '') => {
  const value = category.toLowerCase();
  const map = {
    fruits: 'Fruits',
    fruit: 'Fruits',
    vegetables: 'Vegetables',
    vegetable: 'Vegetables',
    dairy: 'Dairy',
    meat: 'Meat',
    grains: 'Grains',
    beverages: 'Beverages',
    beverage: 'Beverages',
    snacks: 'Snacks',
    snack: 'Snacks',
    condiments: 'Condiments',
    condiment: 'Condiments',
    frozen: 'Frozen',
    other: 'Other'
  };

  return map[value] || 'Other';
};

exports.normalizeCategory = normalizeCategory;

exports.predictExpiryDate = (itemName = '', category = 'Other') => {
  const normalizedName = itemName.toLowerCase();

  for (const [key, days] of Object.entries(expiryDatabase)) {
    if (normalizedName.includes(key)) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    }
  }

  const safeCategory = normalizeCategory(category);
  const days = categoryDefaults[safeCategory] || 14;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
