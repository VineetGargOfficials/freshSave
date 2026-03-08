const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

// Initialize Gemini only if API key exists
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'undefined') {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Gemini:', error.message);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY not found, will use mock recipes');
}

/**
 * Generate recipe suggestions using Gemini AI
 * @param {string[]} ingredients - Array of ingredient names
 * @returns {Promise<Array>} Array of recipe objects
 */
async function generateRecipeSuggestions(ingredients) {
  // Validate input
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    console.warn('⚠️ No ingredients provided');
    return [];
  }

  // If no API key, use mock recipes
  if (!genAI || !process.env.GEMINI_API_KEY) {
    console.log('📝 Using mock recipes (no API key)');
    return getMockRecipes(ingredients);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are a professional chef assistant. Given these ingredients: ${ingredients.join(', ')}, 
suggest 3 creative and practical recipes that can be made using these ingredients.

Focus on recipes that help reduce food waste by using ingredients that might be expiring soon.

Return ONLY valid JSON array (no markdown, no code blocks, no extra text) in this exact format:
[
  {
    "title": "Recipe Name",
    "description": "Brief appetizing description in one sentence",
    "ingredients": ["2 bananas", "1 cup milk", "1 tbsp honey"],
    "instructions": [
      {"step": 1, "description": "First step instructions", "duration": 5},
      {"step": 2, "description": "Second step instructions", "duration": 10}
    ],
    "prepTime": 10,
    "cookTime": 20,
    "servings": 2,
    "category": "breakfast",
    "difficulty": "easy",
    "youtubeSearch": "banana smoothie recipe"
  }
]`;

    console.log('🤖 Requesting recipes from Gemini AI...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    console.log('📥 Received response from Gemini');
    
    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    const recipes = JSON.parse(text);
    
    // Validate and ensure it's an array
    if (!Array.isArray(recipes)) {
      throw new Error('Invalid response format - not an array');
    }

    if (recipes.length === 0) {
      throw new Error('No recipes returned from AI');
    }
    
    console.log(`✅ Generated ${recipes.length} recipes successfully`);
    return recipes;

  } catch (error) {
    console.error('❌ Gemini Recipe generation error:', error.message);
    
    // Fallback to mock recipes if API fails
    console.log('⚠️ Falling back to mock recipes');
    return getMockRecipes(ingredients);
  }
}

/**
 * Mock recipe generator - fallback when API is unavailable
 * @param {string[]} ingredients - Array of ingredient names
 * @returns {Array} Array of recipe objects
 */
function getMockRecipes(ingredients) {
  // Validate input
  if (!ingredients || !Array.isArray(ingredients)) {
    console.warn('⚠️ Invalid ingredients for mock recipes');
    return getDefaultRecipes();
  }

  const recipes = [];
  const ingredientNames = ingredients.map(i => 
    typeof i === 'string' ? i.toLowerCase() : String(i).toLowerCase()
  );

  console.log('📝 Generating mock recipes for:', ingredientNames.join(', '));

  // Banana recipes
  if (ingredientNames.some(i => i.includes('banana'))) {
    recipes.push({
      title: 'Banana Smoothie Bowl',
      description: 'Healthy and delicious breakfast bowl with fresh bananas',
      ingredients: ['2 bananas', '1 cup milk', '1 tbsp honey', 'toppings of choice'],
      instructions: [
        { step: 1, description: 'Slice bananas and freeze for 10 minutes', duration: 10 },
        { step: 2, description: 'Blend frozen bananas with milk until smooth and creamy', duration: 2 },
        { step: 3, description: 'Pour into bowl and add your favorite toppings', duration: 1 }
      ],
      prepTime: 5,
      cookTime: 0,
      servings: 2,
      category: 'breakfast',
      difficulty: 'easy',
      youtubeSearch: 'banana smoothie bowl recipe'
    });
  }

  // Strawberry recipes
  if (ingredientNames.some(i => i.includes('strawberry') || i.includes('strawberries'))) {
    recipes.push({
      title: 'Fresh Strawberry Parfait',
      description: 'Layered dessert with fresh strawberries and cream',
      ingredients: ['1 cup strawberries', '1 cup yogurt', '2 tbsp honey', 'granola'],
      instructions: [
        { step: 1, description: 'Wash and slice strawberries', duration: 5 },
        { step: 2, description: 'Mix yogurt with honey', duration: 2 },
        { step: 3, description: 'Layer yogurt, strawberries, and granola in glasses', duration: 3 }
      ],
      prepTime: 10,
      cookTime: 0,
      servings: 2,
      category: 'dessert',
      difficulty: 'easy',
      youtubeSearch: 'strawberry parfait recipe'
    });
  }

  // Egg recipes
  if (ingredientNames.some(i => i.includes('egg'))) {
    recipes.push({
      title: 'Veggie Scrambled Eggs',
      description: 'Quick protein-packed breakfast with fluffy scrambled eggs',
      ingredients: ['3 eggs', '1/2 cup mixed vegetables', 'salt', 'pepper', '1 tbsp butter'],
      instructions: [
        { step: 1, description: 'Beat eggs with salt and pepper in a bowl', duration: 2 },
        { step: 2, description: 'Melt butter in pan and cook vegetables until soft', duration: 3 },
        { step: 3, description: 'Add beaten eggs and scramble gently until just set', duration: 4 },
        { step: 4, description: 'Remove from heat and serve immediately', duration: 1 }
      ],
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      category: 'breakfast',
      difficulty: 'easy',
      youtubeSearch: 'veggie scrambled eggs recipe'
    });
  }

  // Milk recipes
  if (ingredientNames.some(i => i.includes('milk'))) {
    recipes.push({
      title: 'Creamy Hot Chocolate',
      description: 'Warm and comforting drink perfect for any time',
      ingredients: ['2 cups milk', '2 tbsp cocoa powder', '2 tbsp sugar', 'vanilla extract'],
      instructions: [
        { step: 1, description: 'Heat milk in a saucepan over medium heat', duration: 5 },
        { step: 2, description: 'Whisk in cocoa powder and sugar', duration: 2 },
        { step: 3, description: 'Add vanilla and stir until well combined', duration: 1 },
        { step: 4, description: 'Pour into mugs and serve hot', duration: 1 }
      ],
      prepTime: 2,
      cookTime: 8,
      servings: 2,
      category: 'beverage',
      difficulty: 'easy',
      youtubeSearch: 'homemade hot chocolate recipe'
    });
  }

  // Chicken recipes
  if (ingredientNames.some(i => i.includes('chicken'))) {
    recipes.push({
      title: 'Quick Chicken Stir-Fry',
      description: 'Fast and flavorful chicken with crispy vegetables',
      ingredients: ['300g chicken breast', '2 cups mixed vegetables', '3 tbsp soy sauce', '2 cloves garlic', '1 tsp ginger'],
      instructions: [
        { step: 1, description: 'Cut chicken into bite-sized pieces and season', duration: 5 },
        { step: 2, description: 'Heat oil in wok and stir-fry chicken until golden', duration: 6 },
        { step: 3, description: 'Add garlic, ginger, and vegetables', duration: 2 },
        { step: 4, description: 'Add soy sauce and cook until vegetables are tender-crisp', duration: 4 }
      ],
      prepTime: 10,
      cookTime: 15,
      servings: 3,
      category: 'dinner',
      difficulty: 'medium',
      youtubeSearch: 'chicken stir fry recipe'
    });
  }

  // Tomato recipes
  if (ingredientNames.some(i => i.includes('tomato'))) {
    recipes.push({
      title: 'Fresh Tomato Pasta',
      description: 'Simple pasta with vibrant fresh tomato sauce',
      ingredients: ['4 ripe tomatoes', '250g pasta', '3 cloves garlic', 'fresh basil', 'olive oil'],
      instructions: [
        { step: 1, description: 'Cook pasta until al dente', duration: 10 },
        { step: 2, description: 'Dice tomatoes and mince garlic', duration: 5 },
        { step: 3, description: 'Sauté garlic in olive oil until fragrant', duration: 2 },
        { step: 4, description: 'Add tomatoes and simmer until sauce-like', duration: 8 },
        { step: 5, description: 'Toss pasta with sauce and fresh basil', duration: 2 }
      ],
      prepTime: 8,
      cookTime: 20,
      servings: 3,
      category: 'lunch',
      difficulty: 'easy',
      youtubeSearch: 'fresh tomato pasta recipe'
    });
  }

  // Default recipe if no specific ingredients matched
  if (recipes.length === 0) {
    recipes.push({
      title: 'Mixed Ingredient Stir-Fry',
      description: 'Use up your expiring ingredients in one delicious dish',
      ingredients: ingredientNames.map(ing => `Your ${ing}`),
      instructions: [
        { step: 1, description: 'Wash and chop all ingredients into bite-sized pieces', duration: 10 },
        { step: 2, description: 'Heat oil in a large pan over medium-high heat', duration: 2 },
        { step: 3, description: 'Add harder vegetables first and cook', duration: 5 },
        { step: 4, description: 'Add remaining ingredients and season to taste', duration: 5 },
        { step: 5, description: 'Cook until everything is tender and serve', duration: 3 }
      ],
      prepTime: 15,
      cookTime: 15,
      servings: 3,
      category: 'lunch',
      difficulty: 'easy',
      youtubeSearch: `${ingredientNames.slice(0, 2).join(' ')} recipe`
    });
  }

  console.log(`✅ Generated ${recipes.length} mock recipes`);
  return recipes;
}

/**
 * Get default recipes when no ingredients are provided
 * @returns {Array} Array of default recipe objects
 */
function getDefaultRecipes() {
  return [
    {
      title: 'Simple Pantry Meal',
      description: 'A basic recipe using common pantry staples',
      ingredients: ['Basic pantry items', 'Salt', 'Pepper', 'Oil'],
      instructions: [
        { step: 1, description: 'Gather available ingredients from your pantry', duration: 5 },
        { step: 2, description: 'Prepare ingredients as needed', duration: 10 },
        { step: 3, description: 'Cook with love and creativity', duration: 15 }
      ],
      prepTime: 5,
      cookTime: 20,
      servings: 2,
      category: 'lunch',
      difficulty: 'easy',
      youtubeSearch: 'simple cooking recipes'
    }
  ];
}

// Export functions
module.exports = {
  generateRecipeSuggestions,
  getMockRecipes,
  getDefaultRecipes
};