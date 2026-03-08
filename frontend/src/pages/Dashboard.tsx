import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Clock, Apple, RefreshCw, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  fresh: { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Fresh" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", label: "Expiring Soon" },
  urgent: { bg: "bg-urgent/10", text: "text-urgent", border: "border-urgent/20", label: "Use Today!" },
  expired: { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", label: "Expired" },
  consumed: { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", label: "Consumed" }
};

const categoryEmoji: Record<string, string> = {
  Fruits: "🍎", Vegetables: "🥬", Dairy: "🧀", Meat: "🥩",
  Grains: "🌾", Beverages: "🥤", Snacks: "🍿", Condiments: "🧂",
  Frozen: "🧊", Other: "📦",
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

export default function Dashboard() {
  const { token } = useAuth();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  

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
        toast.success('Marked as consumed!');
      }
    } catch (error: any) {
      console.error('Consume error:', error);
      toast.error(error.response?.data?.message || 'Failed to mark as consumed');
    }
  };

  // Sort by expiry date
  const sorted = [...items].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  // Calculate stats
  const stats = {
    total: items.length,
    fresh: items.filter((i) => i.status === "fresh").length,
    warning: items.filter((i) => i.status === "warning").length,
    urgent: items.filter((i) => i.status === "urgent" || i.status === "expired").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your food, reduce waste</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="icon"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Items", value: stats.total, icon: Apple, color: "text-foreground" },
          { label: "Fresh", value: stats.fresh, icon: Clock, color: "text-success" },
          { label: "Expiring", value: stats.warning, icon: AlertTriangle, color: "text-warning" },
          { label: "Urgent", value: stats.urgent, icon: AlertTriangle, color: "text-urgent" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card p-4">
              <div className="flex items-center gap-2">
                <stat.icon className={cn("h-4 w-4", stat.color)} />
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Food list */}
      {sorted.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-lg font-medium text-foreground">No food items yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add your first item to start tracking</p>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {sorted.map((item) => {
              const days = getDaysUntilExpiry(item.expiryDate);
              const config = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.fresh;
              
              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className={cn("glass-card p-4 flex items-center gap-4 border", config.border)}>
                    <span className="text-2xl">{categoryEmoji[item.category] || "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {item.name}
                        {item.addedVia === 'voice' && (
                          <span className="ml-2 text-xs text-primary">🎤</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} · {item.category}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", config.bg, config.text)}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleConsume(item._id)}
                        className="text-success hover:bg-success/10"
                        title="Mark as consumed"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item._id)}
                        className="text-urgent hover:bg-urgent/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}