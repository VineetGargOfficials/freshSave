import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Trash2, 
  Clock, 
  Apple, 
  RefreshCw, 
  Loader2,
  TrendingDown,
  Leaf,
  Package,
  Filter,
  ChevronDown,
  CheckCircle2,
  Calendar,
  ShoppingCart,
  BarChart3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FoodItem {
  _id: string;
  name: string;
  quantity: string;
  category: string;
  expiryDate: string;
  status: string;
  addedVia?: string;
  createdAt: string;
}

const statusConfig = {
  fresh: { 
    bg: "bg-green-500/10", 
    text: "text-green-600", 
    border: "border-green-500/20", 
    label: "Fresh",
    icon: CheckCircle2,
    color: "text-green-500"
  },
  warning: { 
    bg: "bg-yellow-500/10", 
    text: "text-yellow-600", 
    border: "border-yellow-500/20", 
    label: "Expiring Soon",
    icon: Clock,
    color: "text-yellow-500"
  },
  urgent: { 
    bg: "bg-red-500/10", 
    text: "text-red-600", 
    border: "border-red-500/20", 
    label: "Use Today!",
    icon: AlertTriangle,
    color: "text-red-500"
  },
  expired: { 
    bg: "bg-gray-500/10", 
    text: "text-gray-600", 
    border: "border-gray-500/20", 
    label: "Expired",
    icon: Trash2,
    color: "text-gray-500"
  },
  consumed: { 
    bg: "bg-blue-500/10", 
    text: "text-blue-600", 
    border: "border-blue-500/20", 
    label: "Consumed",
    icon: CheckCircle2,
    color: "text-blue-500"
  }
};

const categoryEmoji: Record<string, string> = {
  Fruits: "🍎", 
  Vegetables: "🥬", 
  Dairy: "🧀", 
  Meat: "🥩",
  Grains: "🌾", 
  Beverages: "🥤", 
  Snacks: "🍿", 
  Condiments: "🧂",
  Frozen: "🧊", 
  Other: "📦",
};

// Calculate days until expiry
function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Group items by status
function groupByStatus(items: FoodItem[]) {
  return {
    urgent: items.filter(i => i.status === "urgent" || i.status === "expired"),
    warning: items.filter(i => i.status === "warning"),
    fresh: items.filter(i => i.status === "fresh"),
  };
}

export default function Dashboard() {
  const { token } = useAuth();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [groupView, setGroupView] = useState(true);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/food`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Fetch food items error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFoodItems();
    setRefreshing(false);
    toast.success('Refreshed!');
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/food/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setItems(items.filter(item => item._id !== id));
        toast.success('Item deleted');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleConsume = async (id: string) => {
    try {
      const response = await axios.put(
        `${API_URL}/food/${id}/consume`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setItems(items.filter(item => item._id !== id));
        toast.success('Marked as consumed! 🎉');
      }
    } catch (error: any) {
      console.error('Consume error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as consumed');
    }
  };

  // Filter items
  const filteredItems = selectedFilter === "all" 
    ? items 
    : items.filter(item => item.status === selectedFilter);

  // Sort by expiry date
  const sorted = [...filteredItems].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const grouped = groupByStatus(filteredItems);

  // Calculate stats
  const stats = {
    total: items.length,
    fresh: items.filter((i) => i.status === "fresh").length,
    warning: items.filter((i) => i.status === "warning").length,
    urgent: items.filter((i) => i.status === "urgent" || i.status === "expired").length,
    wasteReduced: Math.floor(items.length * 0.3), // Mock calculation
  };

  const ItemCard = ({ item }: { item: FoodItem }) => {
    const days = getDaysUntilExpiry(item.expiryDate);
    const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.fresh;
    const StatusIcon = config.icon;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn("glass-card p-4 border hover:shadow-md transition-shadow", config.border)}>
          <div className="flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-2xl", config.bg)}>
              {categoryEmoji[item.category] || "📦"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate">
                  {item.name}
                </p>
                {item.addedVia === 'voice' && (
                  <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5">
                    🎤 Voice
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {item.quantity}
                </span>
                <span>•</span>
                <span>{item.category}</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <Badge variant="outline" className={cn("mb-1", config.bg, config.text, config.border)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`}
              </Badge>
              <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(item.expiryDate).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleConsume(item._id)}
                className="text-green-600 hover:bg-green-500/10"
                title="Mark as consumed"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(item._id)}
                className="text-red-600 hover:bg-red-500/10"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading your food items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Apple className="h-8 w-8 text-primary" />
              Food Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Track your food, reduce waste, save money 💰</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setGroupView(!groupView)}
              title={groupView ? "List view" : "Group view"}
            >
              <BarChart3 className={cn("h-4 w-4", groupView && "text-primary")} />
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="icon"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {[
          { label: "Total Items", value: stats.total, icon: Package, color: "text-primary", bg: "bg-primary/10" },
          { label: "Fresh", value: stats.fresh, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Expiring", value: stats.warning, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
          { label: "Urgent", value: stats.urgent, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Waste Saved", value: `${stats.wasteReduced}%`, icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.08 }}
          >
            <Card className="glass-card p-4 hover:shadow-md transition-shadow">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center mb-2", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {[
          { id: "all", label: "All Items", count: items.length },
          { id: "urgent", label: "Urgent", count: stats.urgent },
          { id: "warning", label: "Expiring Soon", count: stats.warning },
          { id: "fresh", label: "Fresh", count: stats.fresh },
        ].map((filter) => (
          <Button
            key={filter.id}
            variant={selectedFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter(filter.id)}
            className={cn(
              "shrink-0",
              selectedFilter === filter.id && "bg-primary hover:bg-primary/90"
            )}
          >
            {filter.label}
            <Badge variant="secondary" className="ml-2">
              {filter.count}
            </Badge>
          </Button>
        ))}
      </motion.div>

      {/* Food Items */}
      {sorted.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No food items yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Start tracking your food inventory by adding items through voice, manual entry, or OCR scanning.
          </p>
        </Card>
      ) : groupView ? (
        /* Grouped View */
        <div className="space-y-6">
          {grouped.urgent.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold text-foreground">
                  Urgent - Use Today!
                </h2>
                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                  {grouped.urgent.length}
                </Badge>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {grouped.urgent.map((item) => (
                    <ItemCard key={item._id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {grouped.warning.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-foreground">
                  Expiring Soon
                </h2>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  {grouped.warning.length}
                </Badge>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {grouped.warning.map((item) => (
                    <ItemCard key={item._id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {grouped.fresh.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-foreground">
                  Fresh Items
                </h2>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {grouped.fresh.length}
                </Badge>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {grouped.fresh.map((item) => (
                    <ItemCard key={item._id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          <AnimatePresence>
            {sorted.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
