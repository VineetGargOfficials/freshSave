// src/pages/restaurants/RestaurantDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  TrendingUp,
  Utensils,
  Users,
  Clock,
  ArrowRight,
  Bell,
  Plus,
  Package,
  CheckCircle2,
  ArrowUpRight,
  Leaf,
  Target,
  Loader2,
  RefreshCw,
  ToggleRight,
  ToggleLeft,
  Tag,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Listing {
  _id: string;
  name: string;
  category: string;
  listingType: string;
  quantityAvailable: number;
  unit: string;
  price: number;
  discountedPrice?: number;
  expiryDate?: string;
  daysUntilExpiry?: number | null;
  status: string;
  isAvailable: boolean;
  totalReservations: number;
  createdAt: string;
}

interface ClaimRecord {
  _id: string;
  ngo: {
    name: string;
    organizationName?: string;
    phoneNumber?: string;
    email?: string;
  };
  listing: {
    name: string;
    unit: string;
  };
  quantity: number;
  unit: string;
  status: string;
  fulfillmentMethod?: 'pickup' | 'delivery';
  claimedAt: string;
}

interface Stats {
  total: number;
  active: number;
  soldOut: number;
  expired: number;
  removed: number;
  totalReservations: number;
  byListingType: Record<string, number>;
  byCategory: Record<string, number>;
}

const statusColor: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  sold_out: "bg-red-500/10 text-red-600 border-red-500/20",
  expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  removed: "bg-muted text-muted-foreground border-border",
};

const typeColor: Record<string, string> = {
  regular: "bg-blue-500/10 text-blue-600",
  surplus: "bg-orange-500/10 text-orange-600",
  discount: "bg-purple-500/10 text-purple-600",
  donation: "bg-green-500/10 text-green-600",
};

export default function RestaurantDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const profileRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const restaurantId = profileRes.data.user?.id || profileRes.data.user?._id;

      const [listingsRes, statsRes, claimsRes] = await Promise.all([
        axios.get(`${API_URL}/restaurants/${restaurantId}/listings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/restaurants/my/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/restaurants/my/claims`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (listingsRes.data.success) setListings(listingsRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (claimsRes.data.success) setClaims(claimsRes.data.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const handleToggle = async (listingId: string) => {
    try {
      const res = await axios.patch(
        `${API_URL}/restaurants/listings/${listingId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setListings((prev) =>
          prev.map((l) =>
            l._id === listingId
              ? { ...l, isAvailable: res.data.data.isAvailable, status: res.data.data.status }
              : l
          )
        );
        // Refresh stats
        const statsRes = await axios.get(`${API_URL}/restaurants/my/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsRes.data.success) setStats(statsRes.data.stats);
        toast({ title: res.data.message });
      }
    } catch {
      toast({ title: "Error toggling listing", variant: "destructive" });
    }
  };

  const activeListings = listings.filter((l) => l.status === "active");
  const recentListings = [...listings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const statCards = [
    {
      label: "Food Listed",
      value: stats?.total ?? 0,
      sub: `${stats?.active ?? 0} active`,
      icon: Utensils,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Active Now",
      value: stats?.active ?? 0,
      sub: `${stats?.soldOut ?? 0} sold out`,
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Reservations",
      value: stats?.totalReservations ?? 0,
      sub: "Total add-to-fridge",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Sold Out",
      value: stats?.soldOut ?? 0,
      sub: `${stats?.expired ?? 0} expired`,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  const quickInsights = [
    {
      title: "Total Reservations",
      value: stats?.totalReservations ?? 0,
      subtitle: "Items added to user fridges",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Surplus Listed",
      value: stats?.byListingType?.["surplus"] ?? 0,
      subtitle: "Surplus food listings",
      icon: <Leaf className="h-5 w-5" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Donations",
      value: stats?.byListingType?.["donation"] ?? 0,
      subtitle: "Donation listings",
      icon: <Target className="h-5 w-5" />,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Hello, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.organizationName && (
              <span className="text-primary font-medium">{user.organizationName}</span>
            )}
            {user?.organizationName && " · "}
            Manage your food listings & donations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={loading}
          className="w-fit"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Quick Action Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="glass-card p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Have surplus food?</h3>
                <p className="text-sm text-muted-foreground">
                  List it now — users can add it directly to their fridge
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/restaurant/list-food")}
              className="bg-gradient-to-r gradient-primary text-white w-full sm:w-auto"
            >
              Add Listing
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  {loading ? (
                    <div className="h-7 w-12 bg-muted animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground/60">{stat.sub}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="grid sm:grid-cols-3 gap-4">
        {quickInsights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
          >
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                  <div className={insight.color}>{insight.icon}</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{insight.title}</p>
                  {loading ? (
                    <div className="h-6 w-8 bg-muted animate-pulse rounded mt-1" />
                  ) : (
                    <p className="text-lg font-bold text-foreground">{insight.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{insight.subtitle}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Grid: Active Listings + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Listings – LIVE from API */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-500" />
                Active Listings
                <Badge variant="outline" className="text-green-600 border-green-500/30">
                  {activeListings.length}
                </Badge>
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/restaurant/list-food")}
              >
                Manage All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading listings…
              </div>
            ) : activeListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No active listings</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Create one to start accepting reservations
                </p>
                <Button
                  size="sm"
                  className="mt-4 gradient-primary text-white"
                  onClick={() => navigate("/restaurant/list-food")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Listing
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {activeListings.map((listing, index) => (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.06 }}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-foreground text-sm">{listing.name}</h3>
                          <Badge variant="outline" className={`text-xs ${typeColor[listing.listingType]}`}>
                            {listing.listingType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {listing.quantityAvailable} {listing.unit}
                          </span>
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {listing.category}
                          </span>
                          {listing.price > 0 && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${listing.discountedPrice ?? listing.price}
                            </span>
                          )}
                          {listing.expiryDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Expires {new Date(listing.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-500/20 text-xs"
                        >
                          {listing.totalReservations} reserved
                        </Badge>
                        <button
                          onClick={() => handleToggle(listing._id)}
                          title="Toggle availability"
                          className="p-1 rounded hover:bg-muted transition-colors"
                        >
                          <ToggleRight className="h-5 w-5 text-green-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        Listed {new Date(listing.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => navigate("/restaurant/list-food")}
                      >
                        Manage
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recent Listings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-500" />
                Recent Listings
              </h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : recentListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No listings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentListings.map((listing, index) => (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.06 }}
                    className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Utensils className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{listing.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {listing.quantityAvailable} {listing.unit} ·{" "}
                        <span className={statusColor[listing.status]?.split(" ")[1] ?? ""}>
                          {listing.status.replace("_", " ")}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <button
                        onClick={() => handleToggle(listing._id)}
                        className="p-1 rounded hover:bg-muted"
                      >
                        {listing.isAvailable ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-4"
              size="sm"
              onClick={() => navigate("/restaurant/list-food")}
            >
              View All Listings
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* NGO Claims & Activities Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card p-6 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              NGO Claims & Activities
              {claims.length > 0 && (
                <Badge className="bg-primary/20 text-primary border-none ml-2">
                  {claims.length} New
                </Badge>
              )}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary font-bold"
              onClick={() => navigate("/restaurant/history")}
            >
              View Claim History
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 bg-background/40 rounded-2xl border border-dashed border-border text-center">
              <Users className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground font-medium">No claims from NGO partners yet</p>
              <p className="text-xs text-muted-foreground/60">When NGOs claim your food, they will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {claims.map((claim, index) => (
                <motion.div
                  key={claim._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="p-4 rounded-xl bg-background border border-border shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shadow-inner">
                      🏢
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/20">
                        {claim.status}
                      </Badge>
                      {claim.fulfillmentMethod && (
                        <Badge variant="secondary" className="text-[9px] uppercase font-bold bg-blue-500/5 text-blue-600 border-blue-500/10">
                          {claim.fulfillmentMethod === 'pickup' ? '🏃 Pickup' : '🚚 Delivery'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-foreground truncate">{claim.ngo.organizationName || claim.ngo.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>NGO Partner</span>
                  </div>
                  
                  <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Item Claimed</span>
                      <span className="text-[10px] font-bold text-primary">
                        {claim.quantity} {claim.unit || claim.listing.unit}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {claim.listing?.name || "Unknown Item"}
                    </p>
                  </div>

                    <div className="flex flex-col gap-1 mt-3">
                      {claim.ngo.phoneNumber && (
                        <a 
                          href={`tel:${claim.ngo.phoneNumber}`}
                          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                        >
                          📞 {claim.ngo.phoneNumber}
                        </a>
                      )}
                      {claim.ngo.email && (
                        <a 
                          href={`mailto:${claim.ngo.email}`}
                          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium truncate"
                        >
                          ✉️ {claim.ngo.email}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-[10px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(claim.claimedAt).toLocaleDateString()}
                      </span>
                      <button 
                        className="text-primary hover:underline font-bold"
                        onClick={() => {
                          if (claim.ngo.email) window.location.href = `mailto:${claim.ngo.email}`;
                          else if (claim.ngo.phoneNumber) window.location.href = `tel:${claim.ngo.phoneNumber}`;
                        }}
                      >
                        Contact NGO
                      </button>
                    </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Breakdown by Category */}
      {stats && Object.keys(stats.byCategory).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="glass-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-blue-500" />
              Listings by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <div
                  key={cat}
                  className="p-3 rounded-lg bg-muted/30 text-center hover:bg-muted/50 transition-colors"
                >
                  <p className="text-xl font-bold text-foreground">{count as number}</p>
                  <p className="text-xs text-muted-foreground mt-1">{cat}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* No data state - first time user */}
      {!loading && listings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card p-8 text-center bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
            <Package className="h-16 w-16 text-orange-500/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Welcome to your Restaurant Dashboard!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by listing your first food item so users can discover and add it to their fridge.
            </p>
            <Button
              onClick={() => navigate("/restaurant/list-food")}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Listing
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}