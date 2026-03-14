import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed,
  ExternalLink,
  ChefHat,
  Loader2,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Flame,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Instruction {
  step: number;
  description: string;
  duration: number;
}

interface Recipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: Instruction[];
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
  difficulty: string;
  youtubeSearch: string;
  image?: string | null;
  sourceUrl?: string | null;
}

interface FoodItem {
  _id: string;
  name: string;
  quantity: string;
  category: string;
  expiryDate: string;
  status: string;
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

// Difficulty badge colors
function getDifficultyConfig(difficulty: string) {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return { color: "text-green-500 border-green-500/30 bg-green-500/10", label: "Easy" };
    case "medium":
      return { color: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10", label: "Medium" };
    case "hard":
      return { color: "text-red-500 border-red-500/30 bg-red-500/10", label: "Hard" };
    default:
      return { color: "text-gray-500 border-gray-500/30 bg-gray-500/10", label: "Medium" };
  }
}

// Category emoji
function getCategoryEmoji(category: string) {
  switch (category?.toLowerCase()) {
    case "breakfast":
      return "🍳";
    case "lunch":
      return "🥗";
    case "dinner":
      return "🍽️";
    case "snack":
      return "🍿";
    case "dessert":
      return "🍰";
    case "beverage":
      return "🥤";
    default:
      return "🍴";
  }
}

export default function RecipeSuggestions() {
  const { token } = useAuth();
  const [allItems, setAllItems] = useState<FoodItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
      setError("Failed to load food items");
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

  const selectAll = () => {
    setSelected(allItems.map((item) => item._id));
  };

  const clearAll = () => {
    setSelected([]);
  };

  const handleSuggest = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one ingredient");
      return;
    }

    setSuggesting(true);
    setRecipes([]);
    setError(null);
    setExpandedRecipe(null);

    try {
      const selectedNames = allItems
        .filter((i) => selected.includes(i._id))
        .map((i) => i.name);

      console.log("Requesting recipes for:", selectedNames);

      const response = await axios.post(
        `${API_URL}/recipes/suggest`,
        { ingredients: selectedNames },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Recipe response:", response.data);

      if (response.data.success && response.data.data) {
        const recipesData = response.data.data;
        
        if (Array.isArray(recipesData) && recipesData.length > 0) {
          setRecipes(recipesData);
          toast.success(`Found ${recipesData.length} delicious recipes!`);
        } else {
          setError("No recipes found for these ingredients. Try selecting different items.");
          toast.info("No recipes found. Try different ingredients.");
        }
      } else {
        setError("Unable to generate recipes. Please try again.");
      }
    } catch (error: any) {
      console.error("Recipe suggestion error:", error);
      setError(error.response?.data?.message || "Failed to generate recipes");
      toast.error(
        error.response?.data?.message || "Failed to generate recipe suggestions"
      );
    } finally {
      setSuggesting(false);
    }
  };

  const toggleRecipeExpand = (index: number) => {
    setExpandedRecipe(expandedRecipe === index ? null : index);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center sm:text-left"
      >
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary">
            <ChefHat className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              AI Recipe Suggestions
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Turn expiring food into delicious meals
            </p>
          </div>
        </div>
      </motion.div>

      {/* Ingredient Selector Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card p-5 sm:p-6">
          {/* Header with actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Select Ingredients
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selected.length} of {allItems.length} selected
              </p>
            </div>

            {allItems.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  disabled={selected.length === allItems.length}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={selected.length === 0}
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-sm text-muted-foreground">Loading your food items...</p>
            </div>
          ) : allItems.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">No food items yet</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Add food items to your inventory first to get personalized recipe suggestions
              </p>
            </div>
          ) : (
            /* Ingredient Badges */
            <div className="flex flex-wrap gap-2">
              {allItems
                .filter((item) => item.status !== "consumed")
                .map((item) => {
                  const isSelected = selected.includes(item._id);
                  const days = getDaysUntilExpiry(item.expiryDate);
                  const isExpired = days < 0;
                  const isExpiringSoon = days >= 0 && days <= 3;
                  const isExpiring = days > 3 && days <= 5;

                  return (
                    <motion.div
                      key={item._id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all py-1.5 px-3 text-sm",
                          isSelected && "bg-primary text-primary-foreground shadow-md",
                          !isSelected && isExpired && "border-red-500/60 text-red-500 bg-red-500/5",
                          !isSelected && isExpiringSoon && "border-orange-500/60 text-orange-500 bg-orange-500/5",
                          !isSelected && isExpiring && "border-yellow-500/60 text-yellow-500 bg-yellow-500/5",
                          isExpired && "line-through opacity-60"
                        )}
                        onClick={() => !isExpired && toggleSelect(item._id)}
                      >
                        {item.name}
                        {!isExpired && days <= 5 && (
                          <span className="ml-1.5 text-[10px] opacity-80 font-normal">
                            {days === 0 ? "today" : days === 1 ? "1d" : `${days}d`}
                          </span>
                        )}
                        {isExpired && (
                          <span className="ml-1.5 text-[10px]">expired</span>
                        )}
                      </Badge>
                    </motion.div>
                  );
                })}
            </div>
          )}

          {/* Legend */}
          {allItems.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Expiring soon (1-3 days)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Expiring (4-5 days)</span>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleSuggest}
            disabled={selected.length === 0 || loading || suggesting}
            className="w-full mt-5 gradient-primary text-primary-foreground hover:opacity-90 h-12 text-base font-medium"
          >
            {suggesting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                AI is cooking up recipes...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Get Recipe Ideas ({selected.length} ingredients)
              </>
            )}
          </Button>
        </Card>
      </motion.div>

      {/* Error State */}
      {error && !suggesting && recipes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card p-6 text-center border-yellow-500/30">
            <AlertCircle className="h-10 w-10 mx-auto text-yellow-500 mb-3" />
            <p className="text-foreground font-medium mb-1">{error}</p>
            <p className="text-sm text-muted-foreground mb-4">
              Try selecting different ingredients or click refresh
            </p>
            <Button variant="outline" onClick={handleSuggest} disabled={selected.length === 0}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Recipes Section */}
      <AnimatePresence>
        {recipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Recommended Recipes ({recipes.length})
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSuggest}
                disabled={suggesting}
                className="text-xs"
              >
                <RefreshCw className={cn("h-3.5 w-3.5 mr-1", suggesting && "animate-spin")} />
                Refresh
              </Button>
            </div>

            {/* Recipe Cards */}
            {recipes.map((recipe, index) => {
              const isExpanded = expandedRecipe === index;
              const difficultyConfig = getDifficultyConfig(recipe.difficulty);
              const categoryEmoji = getCategoryEmoji(recipe.category);
              const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card overflow-hidden hover:shadow-lg transition-all duration-300">
                    {/* Recipe Header */}
                    <div className="p-5 sm:p-6">
                      <div className="flex gap-4">
                        {/* Icon / Image */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl overflow-hidden gradient-primary text-2xl">
                          {recipe.image
                            ? <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                            : categoryEmoji
                          }
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground leading-tight">
                                {recipe.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {recipe.description}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn("shrink-0 capitalize", difficultyConfig.color)}
                            >
                              {difficultyConfig.label}
                            </Badge>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-sm text-muted-foreground">
                            {totalTime > 0 && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{totalTime} min</span>
                              </div>
                            )}
                            {recipe.servings && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{recipe.servings} servings</span>
                              </div>
                            )}
                            <Badge variant="secondary" className="capitalize text-xs">
                              {recipe.category || "meal"}
                            </Badge>
                          </div>

                          {/* Ingredients Preview */}
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              Ingredients:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {recipe.ingredients?.slice(0, 5).map((ing, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs font-normal"
                                >
                                  {ing}
                                </Badge>
                              ))}
                              {recipe.ingredients?.length > 5 && (
                                <Badge variant="outline" className="text-xs font-normal">
                                  +{recipe.ingredients.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Button */}
                      {recipe.instructions && recipe.instructions.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRecipeExpand(index)}
                          className="w-full mt-4 text-sm"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Hide Instructions
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Show Instructions ({recipe.instructions.length} steps)
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Expandable Instructions */}
                    <AnimatePresence>
                      {isExpanded && recipe.instructions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                            <div className="border-t border-border/50 pt-4">
                              <h4 className="text-sm font-medium text-foreground mb-3">
                                Step-by-Step Instructions
                              </h4>
                              <div className="space-y-3">
                                {recipe.instructions.map((instruction) => (
                                  <div
                                    key={instruction.step}
                                    className="flex gap-3 p-3 rounded-xl bg-muted/30"
                                  >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                      {instruction.step}
                                    </div>
                                    <div className="flex-1 pt-0.5">
                                      <p className="text-sm text-foreground">
                                        {instruction.description}
                                      </p>
                                      {instruction.duration > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          ~{instruction.duration} minutes
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Footer: YouTube + Source */}
                    <div className="px-5 sm:px-6 py-3 bg-muted/30 border-t border-border/50 flex flex-wrap items-center gap-4">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          recipe.youtubeSearch || recipe.title + " recipe"
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        Watch Video Tutorial
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      {recipe.sourceUrl && (
                        <a
                          href={recipe.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Full Recipe
                        </a>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial Empty State */}
      {!suggesting && !loading && recipes.length === 0 && selected.length > 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card p-8 sm:p-12 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ChefHat className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to Cook?
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              You've selected {selected.length} ingredient{selected.length > 1 ? "s" : ""}.
              Click the button above to get AI-powered recipe suggestions!
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {allItems
                .filter((i) => selected.includes(i._id))
                .slice(0, 5)
                .map((item) => (
                  <Badge key={item._id} variant="secondary">
                    {item.name}
                  </Badge>
                ))}
              {selected.length > 5 && (
                <Badge variant="secondary">+{selected.length - 5} more</Badge>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}