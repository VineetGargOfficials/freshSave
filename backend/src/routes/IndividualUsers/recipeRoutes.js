const express = require('express');
const {
  getRecipeSuggestions,
  getRecipes,
  getRecipe,
  createRecipe,
  likeRecipe
} = require('../../controllers/recipeController');
const { protect } = require('../../middleware/auth');

const router = express.Router();

router.post('/suggest', protect, getRecipeSuggestions);

router.route('/')
  .get(getRecipes)
  .post(protect, createRecipe);

router.get('/:id', getRecipe);
router.put('/:id/like', protect, likeRecipe);

module.exports = router;