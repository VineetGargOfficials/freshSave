const Recipe = require('../models/Recipe');
const recipeService = require('../services/recipeService');

// @desc    Get recipe suggestions based on ingredients
// @route   POST /api/recipes/suggest
// @access  Private
exports.getRecipeSuggestions = async (req, res) => {
  try {
    const { ingredients } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of ingredients'
      });
    }
    
    console.log('🔍 Getting recipe suggestions for:', ingredients);
    
    const recipes = await recipeService.generateRecipeSuggestions(ingredients);
    
    // Ensure recipes is always an array
    const validRecipes = Array.isArray(recipes) ? recipes : [];
    
    res.status(200).json({
      success: true,
      count: validRecipes.length,
      data: validRecipes
    });

  } catch (error) {
    console.error('Get recipe suggestions error:', error);
    
    // Return empty array instead of error to prevent frontend crash
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'Unable to generate recipes at the moment. Please try again.'
    });
  }
};

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    
    let query = {};
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    const recipes = await Recipe.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get recipes'
    });
  }
};

// @desc    Get single recipe
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('createdBy', 'name profileImage');
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: recipe
    });

  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get recipe'
    });
  }
};

// @desc    Create recipe
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    
    const recipe = await Recipe.create(req.body);
    
    res.status(201).json({
      success: true,
      data: recipe
    });

  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create recipe'
    });
  }
};

// @desc    Like/Unlike recipe
// @route   PUT /api/recipes/:id/like
// @access  Private
exports.likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    const likeIndex = recipe.likes.indexOf(req.user.id);
    
    if (likeIndex > -1) {
      recipe.likes.splice(likeIndex, 1);
    } else {
      recipe.likes.push(req.user.id);
    }
    
    await recipe.save();
    
    res.status(200).json({
      success: true,
      data: recipe
    });

  } catch (error) {
    console.error('Like recipe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to like recipe'
    });
  }
};