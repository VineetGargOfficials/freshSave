import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Trash2,
  Clock3,
  Apple,
  RefreshCw,
  Loader2,
  Leaf,
  Package,
  CheckCircle2,
  Calendar,
  ShoppingCart,
  List,
  LayoutGrid,
  Utensils,
  Box,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface FoodItem {
  _id: string;
  name: string;
  quantity: string;
  category: string;
  expiryDate: string;
  status: string;
  addedVia?: string;
}

interface DiscountOffer {
  _id: string;
  name: string;
  discountPercentage?: number;
  discountedPrice?: number;
  restaurant?: {
    name?: string;
    organizationName?: string;
    address?: {
      city?: string;
    };
  };
}

const statusConfig = {
  fresh: {
    label: "Fresh",
    icon: CheckCircle2,
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-300/40",
    card: "border-emerald-500/15 bg-emerald-500/5",
    dot: "bg-emerald-500",
  },
  warning: {
    label: "Expiring Soon",
    icon: Clock3,
    chip: "bg-amber-500/10 text-amber-700 border-amber-300/40",
    card: "border-amber-500/15 bg-amber-500/5",
    dot: "bg-amber-500",
  },
  urgent: {
    label: "Urgent",
    icon: AlertTriangle,
    chip: "bg-rose-500/10 text-rose-700 border-rose-300/40",
    card: "border-rose-500/15 bg-rose-500/5",
    dot: "bg-rose-500",
  },
  expired: {
    label: "Overdue",
    icon: AlertTriangle,
    chip: "bg-rose-600/10 text-rose-800 border-rose-400/40",
    card: "border-rose-600/20 bg-rose-500/7",
    dot: "bg-rose-600",
  },
};

function getDaysUntilExpiry(expiryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getItemStatus(item: FoodItem) {
  if (item.status === "expired") return "expired";
  if (item.status === "urgent") return "urgent";
  if (item.status === "warning") return "warning";
  return "fresh";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  return fallback;
}

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<FoodItem[]>([]);
  const [offers, setOffers] = useState<DiscountOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [groupView, setGroupView] = useState(true);
  const [showOfferNotification, setShowOfferNotification] = useState(true);

  const fetchFoodItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/food`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to fetch food items"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  const fetchOfferNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/restaurants/listings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          listingType: "discount",
          limit: 20,
        },
      });

      if (response.data?.success) {
        const activeOffers = response.data.data || [];
        setOffers(activeOffers);
        setShowOfferNotification(activeOffers.length > 0);

        if (activeOffers.length > 0) {
          const bestDiscount = Math.max(...activeOffers.map((offer: DiscountOffer) => offer.discountPercentage || 0));
          toast.info(`${activeOffers.length} offer${activeOffers.length !== 1 ? "s" : ""} available now`, {
            description: bestDiscount > 0 ? `Up to ${bestDiscount}% off from restaurant partners.` : "New discounted restaurant items are available.",
          });
        }
      }
    } catch {
      setOffers([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchOfferNotifications();
    }
  }, [token, fetchOfferNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFoodItems();
    setRefreshing(false);
    toast.success("Inventory refreshed");
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/food/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        toast.success("Item removed");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete item"));
    }
  };

  const handleConsume = async (id: string) => {
    try {
      const response = await axios.put(
        `${API_URL}/food/${id}/consume`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setItems((prev) => prev.filter((item) => item._id !== id));
        toast.success("Marked as consumed");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to mark as consumed"));
    }
  };

  const stats = useMemo(() => {
    const fresh = items.filter((i) => i.status === "fresh").length;
    const warning = items.filter((i) => i.status === "warning").length;
    const urgent = items.filter((i) => i.status === "urgent" || i.status === "expired").length;
    const wasteSaved = items.length > 0 ? Math.max(1, Math.min(99, Math.round((fresh / items.length) * 100))) : 0;
    return { total: items.length, fresh, warning, urgent, wasteSaved };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === "all") return items;
    if (selectedFilter === "urgent") return items.filter((item) => item.status === "urgent" || item.status === "expired");
    return items.filter((item) => item.status === selectedFilter);
  }, [items, selectedFilter]);

  const sortedItems = useMemo(
    () => [...filteredItems].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()),
    [filteredItems]
  );

  const groupedItems = useMemo(
    () => ({
      urgent: sortedItems.filter((i) => i.status === "urgent" || i.status === "expired"),
      warning: sortedItems.filter((i) => i.status === "warning"),
      fresh: sortedItems.filter((i) => i.status === "fresh"),
    }),
    [sortedItems]
  );

  const filters = [
    { id: "all", label: "All Items", count: items.length, tone: "bg-slate-900 text-white border-slate-900" },
    { id: "urgent", label: "Urgent", count: stats.urgent, tone: "bg-rose-600 text-white border-rose-700" },
    { id: "warning", label: "Expiring Soon", count: stats.warning, tone: "bg-amber-500 text-amber-950 border-amber-600" },
    { id: "fresh", label: "Fresh", count: stats.fresh, tone: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  ];

  const statCards = [
    { title: "Total Items", value: stats.total, icon: Package, chip: "bg-slate-900/8 text-slate-700 border-slate-300/50" },
    { title: "Fresh", value: stats.fresh, icon: CheckCircle2, chip: "bg-emerald-500/10 text-emerald-700 border-emerald-300/40" },
    { title: "Expiring", value: stats.warning, icon: Clock3, chip: "bg-amber-500/10 text-amber-700 border-amber-300/40" },
    { title: "Urgent", value: stats.urgent, icon: AlertTriangle, chip: "bg-rose-500/10 text-rose-700 border-rose-300/40" },
    { title: "Waste Saved", value: `${stats.wasteSaved}%`, icon: Leaf, chip: "bg-cyan-500/10 text-cyan-700 border-cyan-300/40" },
  ];

  const topOffers = offers.slice(0, 3);
  const bestDiscount = offers.length > 0 ? Math.max(...offers.map((offer) => offer.discountPercentage || 0)) : 0;

  const ItemCard = ({ item }: { item: FoodItem }) => {
    const days = getDaysUntilExpiry(item.expiryDate);
    const currentStatus = getItemStatus(item);
    const config = statusConfig[currentStatus];
    const StatusIcon = config.icon;
    const dayText = days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Expires today" : `${days}d left`;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={cn("rounded-2xl border p-4 shadow-sm", config.card)}>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700">
              <Box className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-xl font-semibold text-slate-900">{item.name}</p>
                {item.addedVia === "voice" && (
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                    Voice
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-sm text-slate-500">{item.quantity} • {item.category}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={config.chip}>
                  <StatusIcon className="mr-1 h-3 w-3" />
                  {config.label}
                </Badge>
                <Badge variant="outline" className="border-slate-300/60 bg-white text-slate-700">
                  <Calendar className="mr-1 h-3 w-3" />
                  {dayText}
                </Badge>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                onClick={() => handleConsume(item._id)}
                className="rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700"
              >
                <Utensils className="mr-2 h-4 w-4" />
                Consume
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDelete(item._id)}
                className="rounded-xl border-rose-300/80 text-rose-700 hover:bg-rose-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Discard
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Loading your inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <Apple className="h-7 w-7 text-emerald-700" />
              Inventory Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">Track inventory, reduce waste, and manage daily usage.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setGroupView((v) => !v)}
              className="rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              {groupView ? <List className="mr-2 h-4 w-4" /> : <LayoutGrid className="mr-2 h-4 w-4" />}
              {groupView ? "List View" : "Group View"}
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {statCards.map((card, index) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Badge variant="outline" className={cn("mb-3", card.chip)}>
                <card.icon className="mr-1 h-3.5 w-3.5" />
                {card.title}
              </Badge>
              <p className="text-3xl font-semibold text-slate-900">{card.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {offers.length > 0 && showOfferNotification && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <Card className="rounded-3xl border border-amber-300/50 bg-gradient-to-r from-amber-50 via-white to-orange-50 p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                      Special Offers
                    </Badge>
                    <Badge variant="outline">
                      {offers.length} active
                    </Badge>
                    {bestDiscount > 0 && (
                      <Badge variant="outline" className="border-emerald-300/50 bg-emerald-50 text-emerald-700">
                        Up to {bestDiscount}% off
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full text-slate-500 hover:bg-white/80 hover:text-slate-900"
                    onClick={() => setShowOfferNotification(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Discount offers available for you</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    New restaurant discounts are visible now and this notification appears whenever you log in.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {topOffers.map((offer) => {
                    const restaurantName = offer.restaurant?.organizationName || offer.restaurant?.name || "Restaurant";
                    const city = offer.restaurant?.address?.city;
                    return (
                      <div key={offer._id} className="rounded-2xl border border-amber-200/60 bg-white/80 p-3">
                        <p className="font-medium text-slate-900 truncate">{offer.name}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">{restaurantName}{city ? `, ${city}` : ""}</p>
                        <p className="text-sm font-semibold text-amber-700 mt-2">
                          {offer.discountPercentage ? `${offer.discountPercentage}% off` : "Discount available"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={() => navigate("/offers")}
                className="rounded-xl bg-amber-500 text-amber-950 hover:bg-amber-400"
              >
                View Offers & Discounts
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const active = selectedFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                active ? filter.tone : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              )}
            >
              <span>{filter.label}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-white/20" : "bg-slate-100")}>{filter.count}</span>
            </button>
          );
        })}
      </motion.div>

      {sortedItems.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <ShoppingCart className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No inventory items yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Add your first item manually or use scan to start managing your inventory.
          </p>
        </Card>
      ) : groupView ? (
        <div className="space-y-6">
          {(["urgent", "warning", "fresh"] as const).map((groupKey, idx) => {
            const list = groupedItems[groupKey];
            if (list.length === 0) return null;

            const labelMap = {
              urgent: "Urgent Items",
              warning: "Expiring Soon",
              fresh: "Fresh Items",
            };

            return (
              <motion.section
                key={groupKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", statusConfig[groupKey].dot)} />
                  <h2 className="text-lg font-semibold text-slate-900">{labelMap[groupKey]}</h2>
                  <Badge variant="outline" className={statusConfig[groupKey].chip}>
                    {list.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {list.map((item) => (
                      <ItemCard key={item._id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {sortedItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
