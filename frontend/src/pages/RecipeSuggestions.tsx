import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, ExternalLink, ChefHat, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  youtubeSearch: string;
}

interface FoodItem {
  _id: string;
  name: string;
  quantity: string;
  category: string;
  expiryDate: string;
  status: string;
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

  if (recipes.length === 0 && names.length > 0) {
    recipes.push({
      title: "Kitchen Sink Soup",
      description: "Throw all your expiring ingredients into a pot!",
      ingredients: names,
      youtubeSearch: `${names.slice(0, 3).join(" ")} soup recipe`,
    });
  }

  return recipes;
}

// Helper: days until expiry
function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function RecipeSuggestions() {
  const { token } = useAuth();
  const [allItems, setAllItems] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/food`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const items: FoodItem[] = response.data.data || [];
        setAllItems(items);

        // Auto-select items expiring in next 5 days
        const expiringIds = items
          .filter((item) => {
            const days = getDaysUntilExpiry(item.expiryDate);
            return days >= 0 && days <= 5 && item.status !== "consumed";
          })
          .map((item) => item._id);

        setSelected(expiringIds);
      }
    } catch (error: any) {
      console.error("Fetch food items error:", error);
      toast.error(error.response?.data?.message || "Failed to load food items");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSuggest = () => {
    setSuggesting(true);
    try {
      const selectedNames = allItems
        .filter((i) => selected.includes(i._id))
        .map((i) => i.name);
      const suggested = suggestRecipes(selectedNames);
      setRecipes(suggested);
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Recipe Ideas</h1>
        <p className="text-muted-foreground mt-1">
          Turn your expiring food into delicious meals
        </p>
      </motion.div>

      {/* Ingredient selector */}
      <Card className="glass-card p-5">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Select ingredients to use:
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : allItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Add food items first to get recipe suggestions
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allItems.map((item) => {
              const isSelected = selected.includes(item._id);
              const days = getDaysUntilExpiry(item.expiryDate);
              const isExpiringSoon = days >= 0 && days <= 5;

              return (
                <Badge
                  key={item._id}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected && "bg-primary text-primary-foreground",
                    isExpiringSoon && !isSelected && "border-warning/60 text-warning"
                  )}
                  onClick={() => toggleSelect(item._id)}
                >
                  {item.name}
                  {isExpiringSoon && (
                    <span className="ml-1 text-[10px] opacity-80">
                      ({days === 0 ? "today" : `${days}d`})
                    </span>
                  )}
                </Badge>
              );
            })}
          </div>
        )}

        <Button
          onClick={handleSuggest}
          disabled={selected.length === 0 || loading || suggesting}
          className="w-full mt-4 gradient-primary text-primary-foreground hover:opacity-90"
        >
          {suggesting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating recipes...
            </>
          ) : (
            <>
              <ChefHat className="h-4 w-4 mr-2" /> Get Recipe Ideas
            </>
          )}
        </Button>
      </Card>

      {/* Recipes */}
      {recipes.length > 0 && (
        <div className="space-y-3">
          {recipes.map((recipe, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-primary">
                    <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {recipe.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.ingredients.map((ing) => (
                        <Badge key={ing} variant="outline" className="text-xs">
                          {ing}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    recipe.youtubeSearch
                  )}`}
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