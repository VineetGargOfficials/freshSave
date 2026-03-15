// src/pages/ngo/NGODashboard.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Utensils,
  ArrowRight,
  Calendar,
  Building2,
  Package,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Phone,
  Award,
  Target,
  Leaf,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Heart,
  ExternalLink,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- Types ---
interface FoodListing {
  _id: string;
  name: string;
  description: string;
  category: string;
  quantity: string;
  expiryDate?: string;
  partnerType: 'restaurant' | 'individual';
  partner: {
    _id: string;
    name: string;
    organizationName?: string;
    address: {
      fullAddress?: string;
      city?: string;
    };
    profileImage?: string;
    phoneNumber?: string;
  };
  createdAt: string;
}

const stats = [
  { label: "Meals Collected", value: "1,248", change: "+156", icon: Utensils, color: "text-green-500", bgColor: "bg-green-500/10" },
  { label: "Partner Organizations", value: "18", change: "+3", icon: Building2, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { label: "Active Volunteers", value: "24", change: "+2", icon: Users, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { label: "Today's Pickups", value: "5", change: "Scheduled", icon: Clock, color: "text-orange-500", bgColor: "bg-orange-500/10" },
];

const quickInsights = [
  {
    title: "This Week's Impact",
    value: "348 meals",
    subtitle: "Served to 156 people",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "CO2 Saved",
    value: "52 kg",
    subtitle: "Environmental impact",
    icon: <Leaf className="h-5 w-5" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Monthly Goal",
    value: "348/400",
    subtitle: "87% complete",
    icon: <Target className="h-5 w-5" />,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function NGOHome() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async (isRefreshing = false) => {
    try {
      console.log("[NGODashboard] fetchListings started", { isRefreshing, hasToken: !!token });
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      const apiUrl = `${import.meta.env.VITE_API_URL}/restaurants/connected/listings`;
      console.log("[NGODashboard] Requesting:", apiUrl);

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("[NGODashboard] Response received:", response.data);

      if (response.data.success) {
        console.log(`[NGODashboard] Found ${response.data.data.length} listings`);
        setListings(response.data.data);
      }
    } catch (error: any) {
      console.error("[NGODashboard] Failed to fetch listings:", error);
      if (error.response) {
        console.error("[NGODashboard] Error response data:", error.response.data);
        console.error("[NGODashboard] Error status:", error.response.status);
      }
      toast.error("Could not load recent donations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) fetchListings();
  }, [token]);

  const getTimeRemaining = (expiryDate?: string) => {
    if (!expiryDate) return "No expiry set";
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  };

  return (
    <div className="space-y-6 pb-12">
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
            Here's what's happening with your partners
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchListings(true)} 
            disabled={refreshing}
            className="rounded-full h-10 px-4"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Badge className="bg-primary/10 text-primary border-primary/20 py-1.5 px-3 rounded-full text-sm">
            <Users className="h-4 w-4 mr-1.5" />
            Connected Partner Node
          </Badge>
        </div>
      </motion.div>

      {/* New Donations Alert (Only if there are listings) */}
      <AnimatePresence>
        {listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden"
          >
            <Card className="glass-card p-5 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent border-blue-500/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse">
                    <Bell className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Active Listings Available!</h3>
                    <p className="text-muted-foreground">Items from your connected partners are ready for collection.</p>
                  </div>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 px-8 rounded-xl shadow-lg shadow-blue-600/20 w-full sm:w-auto"
                >
                  View All
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card p-5 group hover:shadow-xl transition-all border-border/50 hover:border-primary/30">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${stat.bgColor} transition-transform group-hover:scale-110`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold tracking-wider px-2 py-0">
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Available Donations section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-7 w-7 text-rose-500" />
              Available Donations
              {listings.length > 0 && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 ml-2 font-bold">
                  {listings.length} Active
                </Badge>
              )}
            </h2>
            <Button variant="ghost" size="sm" className="font-semibold text-primary hover:bg-primary/5 rounded-full" onClick={() => navigate("/ngo/partners")}>
              Manage Connections
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-3xl">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground font-medium">Checking connected partner listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-muted/20 border border-dashed border-border rounded-3xl text-center px-6">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No active listings from partners</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Connect with restaurants or users to see their available food donations here.
              </p>
              <Button onClick={() => navigate("/ngo/partners")} className="bg-primary text-white rounded-full px-8">
                Find Partners
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {listings.map((listing, index) => {
                const partnerName = listing.partnerType === 'restaurant' 
                  ? listing.partner.organizationName || listing.partner.name 
                  : listing.partner.name;
                
                return (
                  <motion.div
                    key={listing._id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-card overflow-hidden group border-border/50 hover:border-primary/30 transition-all hover:shadow-lg shadow-primary/5">
                      {/* Header with status/image placeholder */}
                      <div className="h-24 bg-gradient-to-br from-primary/5 to-transparent p-4 flex justify-between items-start">
                        <div className="h-12 w-12 rounded-xl bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-2xl font-bold">
                          {listing.partner.profileImage ? (
                            <img src={listing.partner.profileImage} alt="" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            listing.partnerType === 'restaurant' ? "🏢" : "👤"
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-bold px-3 py-1 text-[10px] uppercase tracking-wider">
                            {listing.partnerType}
                          </Badge>
                          <Badge variant="outline" className="bg-background/50 backdrop-blur-sm text-[10px]">
                            {listing.category || 'Food'}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="mb-4">
                          <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                            {listing.name}
                          </h3>
                          <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 mt-1">
                            <Clock className="h-3.5 w-3.5" />
                            {getTimeRemaining(listing.expiryDate)}
                          </p>
                        </div>

                        <div className="space-y-2.5 mb-6">
                          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                            {listing.partnerType === 'restaurant' ? (
                              <Building2 className="h-4 w-4 text-primary/70 shrink-0" />
                            ) : (
                              <User className="h-4 w-4 text-primary/70 shrink-0" />
                            )}
                            <span className="font-semibold text-foreground truncate">{partnerName}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                            <Package className="h-4 w-4 text-primary/70 shrink-0" />
                            <span className="font-medium text-foreground">{listing.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary/70 shrink-0" />
                            <span className="truncate">{listing.partner.address?.city || 'Local Area'}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 border-t pt-4">
                          <Button className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-10 shadow-lg shadow-primary/10">
                            <Navigation className="h-4 w-4 mr-2" />
                            Claim
                          </Button>
                          <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/50 hover:text-primary hover:border-primary/30">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar elements */}
        <div className="space-y-6">
          {/* Quick Insights */}
          <Card className="glass-card p-6 border-border/50">
            <h3 className="font-bold text-lg mb-4">Quick Insights</h3>
            <div className="space-y-4">
              {quickInsights.map((insight) => (
                <div key={insight.title} className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-xl shrink-0 mt-0.5", insight.bgColor, insight.color)}>
                    {insight.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                    <p className="text-lg font-bold tracking-tight">{insight.value}</p>
                    <p className="text-xs text-muted-foreground">{insight.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 rounded-xl font-semibold group h-11" onClick={() => navigate("/ngo/analytics")}>
              View Analytics
              <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-all" />
            </Button>
          </Card>

          {/* Volunteer Status / Small Card */}
          <Card className="glass-card p-6 bg-gradient-to-br from-indigo-600/10 to-transparent border-indigo-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <h4 className="font-bold">Team Activity</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              You have <span className="text-foreground font-bold">4 active volunteers</span> currently on duty for pickups.
            </p>
            <div className="flex -space-x-3 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-9 w-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                  {i === 4 ? "+2" : "👤"}
                </div>
              ))}
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11">
              Manage Team
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}