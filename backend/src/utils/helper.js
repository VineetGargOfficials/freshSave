// Date helpers
exports.getDaysUntilDate = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format date
exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Calculate waste statistics
exports.calculateWasteStats = (foodItems) => {
  const stats = {
    totalItems: foodItems.length,
    consumed: 0,
    wasted: 0,
    wastePercentage: 0,
    savedItems: 0
  };

  foodItems.forEach(item => {
    if (item.consumed) {
      stats.consumed++;
      if (item.status === 'expired') {
        stats.wasted++;
      } else {
        stats.savedItems++;
      }
    }
  });

  if (stats.consumed > 0) {
    stats.wastePercentage = ((stats.wasted / stats.consumed) * 100).toFixed(2);
  }

  return stats;
};

// Generate random ID
exports.generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Sanitize user input
exports.sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};