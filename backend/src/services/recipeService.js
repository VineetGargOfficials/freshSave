const axios = require('axios');

// Generate recipe suggestions using AI (Groq/Gemini)
exports.generateRecipeSuggestions = async (ingredients) => {
  try {
    // You can use Groq or Gemini API here
    // For now, returning mock data
    
    const recipes = await this.getMockRecipes(ingredients);
    return recipes;
    
    /* 
    // Example Groq API integration:
    const response = await axios.post(
      'https://api.groq.com/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'user',
            content: `Suggest 3 recipes using these ingredients: ${ingredients.join(', ')}. Format as JSON array with title, description, ingredients, and instructions.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return JSON.parse(response.data.choices[0].message.content);
    */
  } catch (error) {
    console.error('❌ Recipe generation error:', error);
    throw new Error('Failed to generate recipe suggestions');
  }
};

// Mock recipe generator
exports.getMockRecipes = (ingredients) => {
  const recipes = [];
  const ingredientNames = ingredients.map(i => i.toLowerCase());

  if (ingredientNames.some(i => i.includes('banana'))) {
    recipes.push({
      title: 'Banana Smoothie Bowl',
      description: 'Healthy and delicious breakfast bowl',
      ingredients: ['2 bananas', '1 cup milk', '1 tbsp honey', 'toppings of choice'],
      instructions: [
        { step: 1, description: 'Blend bananas with milk until smooth', duration: 2 },
        { step: 2, description: 'Pour into bowl and add toppings', duration: 1 }
      ],
      prepTime: 5,
      cookTime: 0,
      servings: 2,
      category: 'breakfast',
      youtubeSearch: 'banana smoothie bowl recipe'
    });
  }

  if (ingredientNames.some(i => i.includes('egg'))) {
    recipes.push({
      title: 'Veggie Scrambled Eggs',
      description: 'Quick protein-packed breakfast',
      ingredients: ['3 eggs', '1/2 cup mixed vegetables', 'salt', 'pepper', '1 tbsp butter'],
      instructions: [
        { step: 1, description: 'Beat eggs with salt and pepper', duration: 2 },
        { step: 2, description: 'Cook vegetables in butter', duration: 3 },
        { step: 3, description: 'Add eggs and scramble until done', duration: 4 }
      ],
      prepTime: 5,
      cookTime: 7,
      servings: 2,
      category: 'breakfast',
      youtubeSearch: 'veggie scrambled eggs recipe'
    });
  }

  if (ingredientNames.some(i => i.includes('chicken'))) {
    recipes.push({
      title: 'Quick Chicken Stir-Fry',
      description: 'Fast and flavorful dinner',
      ingredients: ['300g chicken breast', '2 cups mixed vegetables', '3 tbsp soy sauce', '2 cloves garlic', 'ginger'],
      instructions: [
        { step: 1, description: 'Cut chicken into bite-sized pieces', duration: 5 },
        { step: 2, description: 'Stir-fry chicken until golden', duration: 6 },
        { step: 3, description: 'Add vegetables and sauce', duration: 5 },
        { step: 4, description: 'Cook until vegetables are tender', duration: 4 }
      ],
      prepTime: 10,
      cookTime: 15,
      servings: 3,
      category: 'dinner',
      youtubeSearch: 'chicken stir fry recipe'
    });
  }

  if (ingredientNames.some(i => i.includes('milk') || i.includes('cheese'))) {
    recipes.push({
      title: 'Creamy Mac and Cheese',
      description: 'Comfort food classic',
      ingredients: ['250g pasta', '2 cups milk', '1 cup cheese', '2 tbsp butter', 'salt', 'pepper'],
      instructions: [
        { step: 1, description: 'Cook pasta according to package directions', duration: 10 },
        { step: 2, description: 'Make cheese sauce with butter, milk, and cheese', duration: 8 },
        { step: 3, description: 'Mix pasta with sauce and serve', duration: 2 }
      ],
      prepTime: 5,
      cookTime: 20,
      servings: 4,
      category: 'dinner',
      youtubeSearch: 'easy mac and cheese recipe'
    });
  }

  // Default recipe if no specific ingredients matched
  if (recipes.length === 0) {
    recipes.push({
      title: 'Kitchen Sink Soup',
      description: 'Use up all your expiring ingredients!',
      ingredients: ingredientNames,
      instructions: [
        { step: 1, description: 'Chop all ingredients', duration: 10 },
        { step: 2, description: 'Sauté aromatics in oil', duration: 5 },
        { step: 3, description: 'Add remaining ingredients and broth', duration: 5 },
        { step: 4, description: 'Simmer until everything is cooked', duration: 20 }
      ],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      category: 'lunch',
      youtubeSearch: `${ingredientNames.slice(0, 3).join(' ')} soup recipe`
    });
  }

  return recipes;
};

// Search YouTube for recipe videos
exports.searchYouTubeRecipes = async (query) => {
  // This would require YouTube Data API key
  // For now, returning search URL
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  return searchUrl;
};