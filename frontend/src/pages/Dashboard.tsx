import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Clock, Apple } from "lucide-react";
import { getFoodItems, removeFoodItem, getDaysUntilExpiry, getExpiryStatus } from "@/lib/storage";
import { FoodItem } from "@/types/food";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusConfig = {
  fresh: { bg: "bg-success/10", text: "text-success", border: "border-success/20", label: "Fresh" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", label: "Expiring Soon" },
  urgent: { bg: "bg-urgent/10", text: "text-urgent", border: "border-urgent/20", label: "Use Today!" },
  expired: { bg: "bg-muted", text: "text-muted-foreground", border: "border-muted", label: "Expired" },
};

const categoryEmoji: Record<string, string> = {
  Fruits: "🍎", Vegetables: "🥬", Dairy: "🧀", Meat: "🥩",
  Grains: "🌾", Beverages: "🥤", Snacks: "🍿", Condiments: "🧂",
  Frozen: "🧊", Other: "📦",
};

export default function Dashboard() {
  const [items, setItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    setItems(getFoodItems());
  }, []);

  const handleDelete = (id: string) => {
    removeFoodItem(id);
    setItems(getFoodItems());
  };

  const sorted = [...items].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  const stats = {
    total: items.length,
    fresh: items.filter((i) => getExpiryStatus(i.expiryDate) === "fresh").length,
    warning: items.filter((i) => getExpiryStatus(i.expiryDate) === "warning").length,
    urgent: items.filter((i) => ["urgent", "expired"].includes(getExpiryStatus(i.expiryDate))).length,
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your food, reduce waste</p>
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
              const status = getExpiryStatus(item.expiryDate);
              const days = getDaysUntilExpiry(item.expiryDate);
              const config = statusConfig[status];
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className={cn("glass-card p-4 flex items-center gap-4 border", config.border)}>
                    <span className="text-2xl">{categoryEmoji[item.category] || "📦"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} · {item.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", config.bg, config.text)}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d left`}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="shrink-0 text-muted-foreground hover:text-urgent">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
