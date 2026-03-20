const FoodItem = require('../models/IndividualUsers/FoodItem');
const ScanHistory = require('../models/IndividualUsers/ScanHistory');
const { detectFridgeItems } = require('../services/visionService');
const ocrService = require('../services/ocrService');
const { normalizeCategory, predictExpiryDate } = require('../services/expiryService');

const reconcileStatuses = async (items) => {
  const updates = [];

  items.forEach((item) => {
    if (item.consumed) {
      return;
    }

    const nextStatus = FoodItem.calculateStatusFromExpiry(item.expiryDate);
    if (item.status !== nextStatus) {
      item.status = nextStatus;
      updates.push({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { status: nextStatus } }
        }
      });
    }
  });

  if (updates.length) {
    await FoodItem.bulkWrite(updates);
  }

  return items;
};

const buildFoodPayload = (body, userId) => ({
  user: userId,
  name: body.name,
  quantity: body.quantity || '1',
  category: normalizeCategory(body.category),
  expiryDate: body.expiryDate,
  addedVia: body.addedVia || 'manual',
  expirySource: body.expirySource || 'manual',
  confidenceScore: body.confidenceScore,
  scanSessionId: body.scanSessionId,
  rawScanText: body.rawScanText,
  scanMetadata: body.scanMetadata,
  notes: body.notes
});

const sanitizeScanItems = (items = [], fallbackDate, rawText, file) =>
  items.map((item) => {
    const aiExpiry = item.expiryDate ? new Date(item.expiryDate) : null;
    const resolvedExpiry = aiExpiry && !Number.isNaN(aiExpiry.getTime())
      ? aiExpiry
      : fallbackDate || predictExpiryDate(item.name, item.category);

    return {
      name: item.name,
      quantity: item.quantity || '1 item',
      category: normalizeCategory(item.category),
      expiryDate: resolvedExpiry,
      status: FoodItem.calculateStatusFromExpiry(resolvedExpiry),
      expirySource: aiExpiry ? 'ocr_detected' : (fallbackDate ? 'ocr_detected' : 'ai_predicted'),
      confidenceScore: item.confidenceScore || 0.5,
      addedVia: 'fridge_scan',
      rawScanText: rawText,
      scanMetadata: {
        imageName: file.originalname,
        detectionProvider: 'gemini-2.5-flash',
        detectedAt: new Date()
      }
    };
  });

exports.getFoodItems = async (req, res) => {
  try {
    const { status, category, sort } = req.query;

    const query = { user: req.user.id, consumed: false };

    if (status) query.status = status;
    if (category) query.category = category;

    let sortOption = { expiryDate: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const foodItems = await FoodItem.find(query).sort(sortOption);
    await reconcileStatuses(foodItems);

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

    await reconcileStatuses([foodItem]);

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

exports.addFoodItem = async (req, res) => {
  try {
    const foodItem = await FoodItem.create(buildFoodPayload(req.body, req.user.id));

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

exports.updateFoodItem = async (req, res) => {
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
        message: 'Not authorized to update this item'
      });
    }

    const fields = ['name', 'quantity', 'category', 'expiryDate', 'notes', 'addedVia', 'expirySource', 'confidenceScore'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        foodItem[field] = field === 'category' ? normalizeCategory(req.body[field]) : req.body[field];
      }
    });

    await foodItem.save();

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

exports.getExpiringItems = async (req, res) => {
  try {
    const days = parseInt(req.params.days, 10) || 3;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const foodItems = await FoodItem.find({
      user: req.user.id,
      consumed: false,
      expiryDate: { $lte: targetDate }
    }).sort({ expiryDate: 1 });
    await reconcileStatuses(foodItems);

    res.status(200).json({
      success: true,
      count: foodItems.filter((item) => item.status !== 'expired').length,
      data: foodItems.filter((item) => item.status !== 'expired')
    });
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get expiring items'
    });
  }
};

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

exports.getStats = async (req, res) => {
  try {
    const allItems = await FoodItem.find({ user: req.user.id });
    await reconcileStatuses(allItems);

    const stats = {
      total: allItems.filter((i) => !i.consumed).length,
      fresh: allItems.filter((i) => i.status === 'fresh' && !i.consumed).length,
      warning: allItems.filter((i) => i.status === 'warning' && !i.consumed).length,
      urgent: allItems.filter((i) => i.status === 'urgent' && !i.consumed).length,
      expired: allItems.filter((i) => i.status === 'expired' && !i.consumed).length,
      consumed: allItems.filter((i) => i.consumed).length,
      byCategory: {},
      wasteReduced: allItems.filter((i) => i.consumed && i.status !== 'expired').length
    };

    allItems.forEach((item) => {
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

exports.scanFridgeItems = async (req, res) => {
  const startTime = Date.now();

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a fridge image'
    });
  }

  try {
    const [detectedItems, rawText] = await Promise.all([
      detectFridgeItems({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype
      }),
      ocrService.extractTextFromImage(req.file.buffer).catch(() => '')
    ]);

    const parsedDate = rawText ? ocrService.parseExpiryDate(rawText) : null;
    const fallbackDate = parsedDate ? new Date(parsedDate) : null;
    const preparedItems = sanitizeScanItems(detectedItems, fallbackDate, rawText, req.file);

    const scanStatus = preparedItems.length ? 'success' : 'partial';
    const scanHistory = await ScanHistory.create({
      user: req.user.id,
      imageName: req.file.originalname,
      imageMimeType: req.file.mimetype,
      totalItemsDetected: preparedItems.length,
      totalItemsSaved: preparedItems.length,
      processingTimeMs: Date.now() - startTime,
      scanStatus,
      detectedItems: preparedItems
    });

    const savedItems = preparedItems.length
      ? await FoodItem.insertMany(
          preparedItems.map((item) => ({
            ...item,
            user: req.user.id,
            scanSessionId: scanHistory._id
          }))
        )
      : [];

    if (savedItems.length) {
      await ScanHistory.findByIdAndUpdate(scanHistory._id, {
        $set: { totalItemsSaved: savedItems.length }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        scanSessionId: scanHistory._id,
        rawText,
        totalDetected: savedItems.length,
        items: savedItems
      }
    });
  } catch (error) {
    console.error('Scan fridge error:', error);

    await ScanHistory.create({
      user: req.user.id,
      imageName: req.file.originalname,
      imageMimeType: req.file.mimetype,
      totalItemsDetected: 0,
      totalItemsSaved: 0,
      processingTimeMs: Date.now() - startTime,
      scanStatus: 'failed',
      errorMessage: error.message
    }).catch(() => null);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to scan fridge image'
    });
  }
};

exports.getScanHistory = async (req, res) => {
  try {
    const history = await ScanHistory.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get scan history'
    });
  }
};
