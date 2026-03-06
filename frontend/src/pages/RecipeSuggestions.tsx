import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, ExternalLink, ChefHat } from "lucide-react";
import { getExpiringItems, getFoodItems } from "@/lib/storage";
import { FoodItem } from "@/types/food";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  youtubeSearch: string;
}

// Mock recipe suggestions based on ingredients
function suggestRecipes(ingredients: string[]): Recipe[] {
  const names = ingredients.map((i) => i.toLowerCase());
  const recipes: Recipe[] = [];

  if (names.some((n) => n.includes("banana"))) {
    recipes.push({
      title: "Banana Smoothie",
      description: "Quick, creamy banana smoothie perfect for breakfast",
      ingredients: ["banana", "milk", "honey"],
      youtubeSearch: "banana smoothie recipe",
    });
  }
  if (names.some((n) => n.includes("milk") || n.includes("cheese"))) {
    recipes.push({
      title: "Mac & Cheese",
      description: "Comforting homemade macaroni and cheese",
      ingredients: ["pasta", "cheese", "milk", "butter"],
      youtubeSearch: "easy mac and cheese recipe",
    });
  }
  if (names.some((n) => n.includes("egg"))) {
    recipes.push({
      title: "Veggie Omelette",
      description: "Fluffy omelette loaded with fresh vegetables",
      ingredients: ["eggs", "vegetables", "cheese"],
      youtubeSearch: "veggie omelette recipe",
    });
  }
  if (names.some((n) => n.includes("chicken"))) {
    recipes.push({
      title: "Quick Chicken Stir-Fry",
      description: "Fast and flavorful chicken with vegetables",
      ingredients: ["chicken", "soy sauce", "vegetables"],
      youtubeSearch: "quick chicken stir fry recipe",
    });
  }
  if (names.some((n) => n.includes("tomato"))) {
    recipes.push({
      title: "Fresh Tomato Pasta",
      description: "Simple pasta with fresh tomato sauce",
      ingredients: ["tomatoes", "pasta", "garlic", "basil"],
      youtubeSearch: "fresh tomato pasta recipe",
    });
  }
  if (names.some((n) => n.includes("rice"))) {
    recipes.push({
      title: "Fried Rice",
      description: "Easy leftover rice turned into a delicious meal",
      ingredients: ["rice", "eggs", "soy sauce", "vegetables"],
      youtubeSearch: "easy fried rice recipe",
    });
  }

  if (recipes.length === 0) {
    recipes.push({
      title: "Kitchen Sink Soup",
      description: "Throw all your expiring ingredients into a pot!",
      ingredients: names,
      youtubeSearch: `${names.slice(0, 3).join(" ")} soup recipe`,
    });
  }

  return recipes;
}

export default function RecipeSuggestions() {
  const [allItems, setAllItems] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const items = getFoodItems();
    setAllItems(items);
    // Auto-select expiring items
    const expiring = getExpiringItems(5);
    setSelected(expiring.map((i) => i.id));
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSuggest = () => {
    const selectedNames = allItems.filter((i) => selected.includes(i.id)).map((i) => i.name);
    setRecipes(suggestRecipes(selectedNames));
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Recipe Ideas</h1>
        <p className="text-muted-foreground mt-1">Turn expiring food into delicious meals</p>
      </motion.div>

      {/* Ingredient selector */}
      <Card className="glass-card p-5">
        <p className="text-sm font-medium text-muted-foreground mb-3">Select ingredients to use:</p>
        <div className="flex flex-wrap gap-2">
          {allItems.map((item) => (
            <Badge
              key={item.id}
              variant={selected.includes(item.id) ? "default" : "outline"}
              className={cn("cursor-pointer transition-all", selected.includes(item.id) && "bg-primary text-primary-foreground")}
              onClick={() => toggleSelect(item.id)}
            >
              {item.name}
            </Badge>
          ))}
        </div>
        {allItems.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Add food items first to get recipe suggestions</p>
        )}
        <Button onClick={handleSuggest} disabled={selected.length === 0} className="w-full mt-4 gradient-primary text-primary-foreground hover:opacity-90">
          <ChefHat className="h-4 w-4 mr-2" /> Get Recipe Ideas
        </Button>
      </Card>

      {/* Recipes */}
      {recipes.length > 0 && (
        <div className="space-y-3">
          {recipes.map((recipe, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary">
                    <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{recipe.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{recipe.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.ingredients.map((ing) => (
                        <Badge key={ing} variant="outline" className="text-xs">{ing}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.youtubeSearch)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Watch on YouTube
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
