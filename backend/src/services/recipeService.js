const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Initialize Gemini (backup AI) ─────────────────────────────────────────────
let genAI = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'undefined') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (e) {
    console.warn('⚠️ Gemini init failed:', e.message);
  }
}

// ── Spoonacular: find recipes by ingredients ───────────────────────────────────
async function fetchFromSpoonacular(ingredients) {
  const key = process.env.SPOONACULAR_API_KEY;
  if (!key || key === 'your_spoonacular_key') return null;

  try {
    // Step 1: find recipes that match ingredients
    const searchRes = await axios.get(
      'https://api.spoonacular.com/recipes/findByIngredients',
      {
        params: {
          apiKey: key,
          ingredients: ingredients.join(','),
          number: 5,
          ranking: 1,        // maximize used ingredients
          ignorePantry: true
        },
        timeout: 8000
      }
    );

    const hits = searchRes.data;
    if (!hits || hits.length === 0) return [];

    // Step 2: get full details for each recipe (bulk)
    const ids = hits.map(r => r.id).join(',');
    const detailRes = await axios.get(
      'https://api.spoonacular.com/recipes/informationBulk',
      {
        params: { apiKey: key, ids, includeNutrition: false },
        timeout: 8000
      }
    );

    const details = detailRes.data;

    return details.map(r => ({
      title: r.title,
      description: r.summary
        ? r.summary.replace(/<[^>]+>/g, '').split('.').slice(0, 2).join('.') + '.'
        : `A delicious recipe using ${ingredients.slice(0, 2).join(' and ')}.`,
      ingredients: r.extendedIngredients
        ? r.extendedIngredients.map(i => i.original)
        : ingredients,
      instructions: r.analyzedInstructions?.[0]?.steps?.map(s => ({
        step: s.number,
        description: s.step,
        duration: s.length?.number || 5
      })) || [
        { step: 1, description: 'Prepare all ingredients.', duration: 5 },
        { step: 2, description: 'Cook according to taste.', duration: 15 }
      ],
      prepTime: r.preparationMinutes > 0 ? r.preparationMinutes : Math.round((r.readyInMinutes || 20) * 0.3),
      cookTime: r.cookingMinutes > 0 ? r.cookingMinutes : Math.round((r.readyInMinutes || 20) * 0.7),
      servings: r.servings || 2,
      category: mapDishType(r.dishTypes),
      difficulty: mapDifficulty(r.readyInMinutes),
      youtubeSearch: `${r.title} recipe`,
      sourceUrl: r.sourceUrl || null,
      image: r.image || null
    }));

  } catch (err) {
    console.error('❌ Spoonacular error:', err.message);
    return null;
  }
}

// ── Gemini AI fallback ─────────────────────────────────────────────────────────
async function fetchFromGemini(ingredients) {
  if (!genAI) return null;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a professional chef. Given these ingredients: ${ingredients.join(', ')}, suggest 3 practical recipes to reduce food waste.

Return ONLY a valid JSON array (no markdown, no code blocks) in this exact format:
[
  {
    "title": "Recipe Name",
    "description": "One appetizing sentence description",
    "ingredients": ["2 cups flour", "1 egg", "etc"],
    "instructions": [
      {"step": 1, "description": "Step description here", "duration": 5}
    ],
    "prepTime": 10,
    "cookTime": 20,
    "servings": 2,
    "category": "dinner",
    "difficulty": "easy",
    "youtubeSearch": "recipe name recipe"
  }
]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text()
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const recipes = JSON.parse(text);
    if (!Array.isArray(recipes) || recipes.length === 0) throw new Error('Bad format');
    return recipes;

  } catch (err) {
    console.error('❌ Gemini error:', err.message);
    return null;
  }
}

// ── Main export ────────────────────────────────────────────────────────────────
async function generateRecipeSuggestions(ingredients) {
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return [];
  }

  console.log(`🔍 Fetching recipes for: ${ingredients.join(', ')}`);

  // 1. Try Spoonacular (real recipes with images)
  const spoonacularRecipes = await fetchFromSpoonacular(ingredients);
  if (spoonacularRecipes && spoonacularRecipes.length > 0) {
    console.log(`✅ Spoonacular returned ${spoonacularRecipes.length} recipes`);
    return spoonacularRecipes;
  }

  // 2. Try Gemini AI
  const geminiRecipes = await fetchFromGemini(ingredients);
  if (geminiRecipes && geminiRecipes.length > 0) {
    console.log(`✅ Gemini returned ${geminiRecipes.length} recipes`);
    return geminiRecipes;
  }

  // 3. Last resort: generic fallback
  console.warn('⚠️ All APIs failed. Returning generic recipe.');
  return [{
    title: `${ingredients[0]} Stir-Fry`,
    description: `A quick and easy dish using your ${ingredients.slice(0, 3).join(', ')}.`,
    ingredients: ingredients.map(i => `Your ${i}`),
    instructions: [
      { step: 1, description: 'Wash and chop all ingredients.', duration: 10 },
      { step: 2, description: 'Heat oil in a pan over medium heat.', duration: 2 },
      { step: 3, description: 'Add ingredients starting with harder ones.', duration: 5 },
      { step: 4, description: 'Season to taste and cook until done.', duration: 8 }
    ],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    category: 'lunch',
    difficulty: 'easy',
    youtubeSearch: `${ingredients.slice(0, 2).join(' ')} recipe`
  }];
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function mapDishType(dishTypes) {
  if (!dishTypes || dishTypes.length === 0) return 'meal';
  if (dishTypes.includes('breakfast')) return 'breakfast';
  if (dishTypes.includes('lunch') || dishTypes.includes('salad') || dishTypes.includes('soup')) return 'lunch';
  if (dishTypes.includes('dinner') || dishTypes.includes('main course')) return 'dinner';
  if (dishTypes.includes('dessert')) return 'dessert';
  if (dishTypes.includes('snack') || dishTypes.includes('appetizer')) return 'snack';
  if (dishTypes.includes('beverage') || dishTypes.includes('drink')) return 'beverage';
  return 'meal';
}

function mapDifficulty(readyInMinutes) {
  if (!readyInMinutes) return 'medium';
  if (readyInMinutes <= 20) return 'easy';
  if (readyInMinutes <= 45) return 'medium';
  return 'hard';
}

module.exports = { generateRecipeSuggestions };