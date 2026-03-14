const FoodItem = require('../models/IndividualUsers/FoodItem');

// @desc    Get all food items for logged-in user
// @route   GET /api/food
// @access  Private
exports.getFoodItems = async (req, res) => {
  try {
    const { status, category, sort } = req.query;
    
    let query = { user: req.user.id, consumed: false };
    
    if (status) query.status = status;
    if (category) query.category = category;
    
    let sortOption = { expiryDate: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    
    const foodItems = await FoodItem.find(query).sort(sortOption);
    
    res.status(200).json({
      success: true,
      count: foodItems.length,
      data: foodItems
    });

  } catch (error) {
    console.error('Get food items error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get food items'
    });
  }
};

// @desc    Get single food item
// @route   GET /api/food/:id
// @access  Private
exports.getFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }
    
    if (foodItem.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this item'
      });
    }
    
    res.status(200).json({
      success: true,
      data: foodItem
    });

  } catch (error) {
    console.error('Get food item error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get food item'
    });
  }
};

// @desc    Add food item
// @route   POST /api/food
// @access  Private
exports.addFoodItem = async (req, res) => {
  try {
    req.body.user = req.user.id;
    
    const foodItem = await FoodItem.create(req.body);
    
    res.status(201).json({
      success: true,
      data: foodItem
    });

  } catch (error) {
    console.error('Add food item error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add food item'
    });
  }
};

// @desc    Update food item
// @route   PUT /api/food/:id
// @access  Private
exports.updateFoodItem = async (req, res) => {
  try {
    let foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }
    
    if (foodItem.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }
    
    foodItem = await FoodItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: foodItem
    });

  } catch (error) {
    console.error('Update food item error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update food item'
    });
  }
};

// @desc    Delete food item
// @route   DELETE /api/food/:id
// @access  Private
exports.deleteFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }
    
    if (foodItem.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }
    
    await foodItem.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Food item deleted'
    });

  } catch (error) {
    console.error('Delete food item error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete food item'
    });
  }
};

// @desc    Get expiring items
// @route   GET /api/food/expiring/:days
// @access  Private
exports.getExpiringItems = async (req, res) => {
  try {
    const days = parseInt(req.params.days) || 3;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    const foodItems = await FoodItem.find({
      user: req.user.id,
      consumed: false,
      expiryDate: { $lte: targetDate },
      status: { $ne: 'expired' }
    }).sort({ expiryDate: 1 });
    
    res.status(200).json({
      success: true,
      count: foodItems.length,
      data: foodItems
    });

  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get expiring items'
    });
  }
};

// @desc    Mark food as consumed
// @route   PUT /api/food/:id/consume
// @access  Private
exports.consumeFood = async (req, res) => {
  try {
    const foodItem = await FoodItem.findById(req.params.id);
    
    if (!foodItem) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found'
      });
    }
    
    if (foodItem.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    foodItem.consumed = true;
    foodItem.consumedDate = Date.now();
    foodItem.status = 'consumed';
    await foodItem.save();
    
    res.status(200).json({
      success: true,
      data: foodItem
    });

  } catch (error) {
    console.error('Consume food error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark as consumed'
    });
  }
};

// @desc    Get statistics
// @route   GET /api/food/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const allItems = await FoodItem.find({ user: req.user.id });
    
    const stats = {
      total: allItems.filter(i => !i.consumed).length,
      fresh: allItems.filter(i => i.status === 'fresh' && !i.consumed).length,
      warning: allItems.filter(i => i.status === 'warning' && !i.consumed).length,
      urgent: allItems.filter(i => i.status === 'urgent' && !i.consumed).length,
      expired: allItems.filter(i => i.status === 'expired' && !i.consumed).length,
      consumed: allItems.filter(i => i.consumed).length,
      byCategory: {},
      wasteReduced: allItems.filter(i => i.consumed && i.status !== 'expired').length
    };
    
    allItems.forEach(item => {
      if (!item.consumed) {
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      }
    });
    
    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get statistics'
    });
  }
};