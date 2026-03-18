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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// --- Types ---
interface FoodListing {
  _id: string;
  name: string;
  description: string;
  category: string;
  quantity: string;
  quantityAvailable?: number;
  unit?: string;
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

interface ClaimedItem {
  _id: string;
  name: string;
  quantity: string;
  status: string;
  expiryDate?: string;
  partnerName: string;
  partnerType: 'restaurant' | 'individual';
  claimedAt: string;
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
  const [myClaims, setMyClaims] = useState<ClaimedItem[]>([]);
  const [claimQuantities, setClaimQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'available' | 'claimed'>('available');
  const [listingFilter, setListingFilter] = useState<'all' | 'partner' | 'community'>('all');

  // Claim process state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [isClaiming, setIsClaiming] = useState(false);

  const fetchListings = async (isRefreshing = false) => {
    try {
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      const [resPartners, resIndividuals] = await Promise.all([
        axios.get(`${API_URL}/restaurants/connected/listings`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/donations?status=available`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const partnerListings = resPartners.data?.success ? resPartners.data.data : [];
      const individualDonationsRaw = resIndividuals.data?.success ? resIndividuals.data.data : [];

      // Deduplicate: If an item is already in partnerListings (connected), don't add it from public donations
      const partnerIds = new Set(partnerListings.map((l: any) => l._id));
      
      const communityDonations = individualDonationsRaw
        .filter((d: any) => !partnerIds.has(d._id))
        .map((d: any) => ({
          _id: d._id,
          name: d.foodDescription.split('\n')[0].substring(0, 40),
          description: d.foodDescription,
          category: d.foodType || 'Other',
          quantity: d.quantity,
          quantityAvailable: d.quantityAvailable || (typeof d.servings === 'number' ? d.servings : 1),
          unit: d.unit || 'portions',
          expiryDate: d.availableUntil,
          partnerType: 'individual',
          partner: {
            _id: d.donor?._id,
            name: d.donor?.name || d.restaurantName || 'Individual Donor',
            organizationName: d.restaurantName || d.donor?.organizationName,
            address: {
              fullAddress: d.pickupLocation?.address,
              city: d.pickupLocation?.address?.split(',').slice(-2, -1)[0]?.trim() || 'Nearby'
            },
            profileImage: d.donor?.profileImage || null,
            phoneNumber: d.donor?.phoneNumber
          },
          createdAt: d.createdAt
        }));

      const combined = [...partnerListings, ...communityDonations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setListings(combined);
      // Store partner count for debug info
      (window as any)._partnerCount = partnerListings.length;
    } catch (error: any) {
      console.error("[NGODashboard] Failed to fetch listings:", error);
      toast.error("Could not load available donations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const [resDonations, resFood] = await Promise.all([
        axios.get(`${API_URL}/donations/my-claims`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/food`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const formattedClaims: ClaimedItem[] = [
        ...(resDonations.data.data || []).map((d: any) => ({
          _id: d._id,
          name: d.foodDescription.split('\n')[0].substring(0, 30),
          quantity: d.quantity,
          status: d.status,
          expiryDate: d.availableUntil,
          partnerName: d.donor?.organizationName || d.donor?.name || 'Individual',
          partnerType: 'individual' as const,
          claimedAt: d.claimedAt || d.createdAt,
        })),
        ...(resFood.data.data || []).map((f: any) => ({
          _id: f._id,
          name: f.name,
          quantity: f.quantity,
          status: f.status,
          expiryDate: f.expiryDate,
          partnerName: f.notes?.includes('Added from') 
            ? f.notes.split('Added from ')[1]?.split(' restaurant')[0] || 'Restaurant'
            : 'Restaurant Partner',
          partnerType: 'restaurant' as const,
          claimedAt: f.createdAt,
        }))
      ].sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime());

      setMyClaims(formattedClaims);
    } catch (error) {
      console.error("Failed to fetch claims:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchListings();
      fetchClaims();
    }
  }, [token]);

  const getTimeRemaining = (expiryDate?: string) => {
    if (!expiryDate) return "No expiry set";
    const diff = new Date(expiryDate).getTime() - new Date().getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${mins}m left` : `${mins}m left`;
  };

  const handleClaim = async () => {
    if (!selectedListing) return;
    
    try {
      setIsClaiming(true);
      const isRestaurant = selectedListing.partnerType === 'restaurant';
      const endpoint = isRestaurant 
        ? `${API_URL}/restaurants/listings/${selectedListing._id}/add-to-fridge`
        : `${API_URL}/donations/${selectedListing._id}/claim`;

      // Get the requested quantity
      const quantityToClaim = claimQuantities[selectedListing._id] || 1;

      // Restaurant uses POST, Individual uses PUT
      const method = isRestaurant ? axios.post : axios.put;
      
      const response = await method(endpoint, { 
        quantity: quantityToClaim,
        fulfillmentMethod: fulfillmentMethod,
        notes: `NGO choice: ${fulfillmentMethod}`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(isRestaurant ? "Item added to your collection!" : "Donation claimed successfully!");
        setIsClaimModalOpen(false);
        fetchListings(true); 
        fetchClaims();
        setActiveView('claimed');
      }
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(error.response?.data?.message || "Failed to claim item");
    } finally {
      setIsClaiming(false);
    }
  };

  const openClaimModal = (listing: FoodListing) => {
    setSelectedListing(listing);
    setFulfillmentMethod('pickup');
    setIsClaimModalOpen(true);
  };

  const handleUpdateClaimStatus = async (claim: ClaimedItem) => {
    try {
      const isRestaurant = claim.partnerType === 'restaurant';
      const endpoint = isRestaurant 
        ? `${import.meta.env.VITE_API_URL}/food/${claim._id}/consume`
        : `${import.meta.env.VITE_API_URL}/donations/${claim._id}/pickup`;

      const response = await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(isRestaurant ? "Item marked as distributed!" : "Donation marked as picked up!");
        fetchClaims();
      }
    } catch (error: any) {
      console.error("Update status error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // Calculate dynamic stats
  const dynamicStats = [
    { label: "Items Claimed", value: myClaims.length.toString(), change: `+${myClaims.filter(c => new Date(c.claimedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}`, icon: Utensils, color: "text-green-500", bgColor: "bg-green-500/10" },
    { label: "Available Items", value: listings.length.toString(), change: "Live", icon: Building2, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { label: "Active Volunteers", value: "24", change: "+2", icon: Users, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { label: "Today's Pickups", value: myClaims.filter(c => c.status === 'claimed').length.toString(), change: "Scheduled", icon: Clock, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  ];

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
        {dynamicStats.map((stat, index) => (
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
          <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-full border border-border/50">
            <Button 
              variant={activeView === 'available' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveView('available')}
              className={cn("rounded-full px-5", activeView === 'available' && "bg-primary text-white shadow-md")}
            >
              Available
            </Button>
            <Button 
              variant={activeView === 'claimed' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setActiveView('claimed')}
              className={cn("rounded-full px-5", activeView === 'claimed' && "bg-primary text-white shadow-md")}
            >
              My Claims
              <Badge className="ml-2 bg-background/20 text-white border-none h-5 px-1.5 min-w-[1.25rem]">
                {myClaims.length}
              </Badge>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9 border-border/50 hover:bg-primary/5 hover:text-primary transition-all"
                onClick={() => fetchListings(true)}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                Sync with Partners
              </Button>
            </div>
          </div>

          {activeView === 'available' && listings.length > 0 && (
            <div className="flex gap-2 pb-2 overflow-x-auto">
              {[
                { id: 'all', label: 'All', icon: <Heart className="h-3 w-3" /> },
                { id: 'partner', label: 'Partner Restaurants', icon: <Building2 className="h-3 w-3" /> },
                { id: 'community', label: 'Community Donations', icon: <Users className="h-3 w-3" /> },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setListingFilter(f.id as any)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0",
                    listingFilter === f.id 
                      ? "bg-primary/10 text-primary border-primary/30" 
                      : "bg-background text-muted-foreground border-border hover:border-primary/20"
                  )}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-3xl">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground font-medium text-center">
                {activeView === 'available' ? 'Checking connected partner listings...' : 'Fetching your active claims...'}
              </p>
            </div>
          ) : activeView === 'available' ? (
            (() => {
              const filteredListings = listings.filter(l => {
                if (listingFilter === 'all') return true;
                if (listingFilter === 'partner') return l.partnerType === 'restaurant';
                if (listingFilter === 'community') return l.partnerType === 'individual';
                return true;
              });

              if (filteredListings.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-24 bg-muted/20 border border-dashed border-border rounded-3xl text-center px-6">
                    <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                      {listingFilter === 'partner' ? <Building2 className="h-8 w-8 text-muted-foreground/50" /> : <Package className="h-8 w-8 text-muted-foreground/50" />}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No {listingFilter !== 'all' ? listingFilter : ''} listings found</h3>
                    <p className="text-muted-foreground max-w-sm mb-2">
                      Try changing your filter or connect with more partners.
                    </p>
                    <div className="p-3 bg-background/50 rounded-xl mb-6 border border-border/50 text-[10px] text-muted-foreground max-w-xs mx-auto">
                      <p className="flex justify-between"><span>Identity:</span> <span className="font-bold text-foreground">{user?.organizationName || user?.name}</span></p>
                      <p className="flex justify-between mt-1"><span>Account ID:</span> <span className="font-mono opacity-80">{user?.id}</span></p>
                      <p className="flex justify-between mt-1"><span>Partner Items:</span> <span className="font-bold text-primary">{(window as any)._partnerCount || 0} found</span></p>
                    </div>
                    {listingFilter === 'partner' && (
                      <Button onClick={() => navigate("/ngo/partners")} className="bg-primary text-white rounded-full px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                        Check Connection Status
                      </Button>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-6">
                  {filteredListings.some(l => l.partnerType === 'restaurant') && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="h-5 w-1 bg-primary rounded-full" />
                      <h4 className="text-sm font-bold text-foreground">Featured Partner Items</h4>
                    </div>
                  )}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {filteredListings.map((listing, index) => {
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
                                <Badge className={cn(
                                  "border-none font-bold px-3 py-1 text-[10px] uppercase tracking-wider",
                                  listing.partnerType === 'restaurant' 
                                    ? "bg-blue-500/10 text-blue-600" 
                                    : "bg-purple-500/10 text-purple-600"
                                )}>
                                  {listing.partnerType === 'restaurant' ? 'Restaurant Partner' : 'Community Donor'}
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
  
                              <div className="space-y-3 border-t pt-4">
                                <div className="flex items-center justify-between px-1">
                                  <label className="text-[10px] uppercase font-bold text-muted-foreground mr-1">
                                    Claim Amount
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      min={1} 
                                      max={listing.quantityAvailable || 999}
                                      value={claimQuantities[listing._id] || 1}
                                      onChange={(e) => setClaimQuantities({
                                        ...claimQuantities,
                                        [listing._id]: parseInt(e.target.value) || 1
                                      })}
                                      className="w-16 h-8 text-center text-xs font-bold rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                                    />
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                      {listing.unit || (listing.partnerType === 'restaurant' ? 'pcs' : 'pts')}
                                    </span>
                                  </div>
                                </div>
  
                                <div className="flex gap-2">
                                  <Button 
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-10 shadow-lg shadow-primary/10"
                                    onClick={() => openClaimModal(listing)}
                                  >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Claim
                                  </Button>
                                  <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-border/50 hover:text-primary hover:border-primary/30">
                                    <Phone className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          ) : (
            /* NEW: Claimed Items View */
            myClaims.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-muted/20 border border-dashed border-border rounded-3xl text-center px-6">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                  <Package className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No active claims</h3>
                <p className="text-muted-foreground max-w-sm">
                  Items you claim from restaurants or users will appear here for pickup.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myClaims.map((claim, index) => (
                  <motion.div
                    key={claim._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card p-4 border-l-4 border-l-primary flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {claim.partnerType === 'restaurant' ? "🏢" : "👤"}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{claim.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                              {claim.partnerType === 'restaurant' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                              {claim.partnerName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {claim.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 text-right">
                        <Badge className={cn(
                          "text-[10px] uppercase font-bold",
                          claim.status === 'claimed' ? "bg-orange-500/10 text-orange-600 border-orange-500/20" : 
                          claim.status === 'picked_up' ? "bg-green-500/10 text-green-600 border-green-500/20" : 
                          "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        )}>
                          {claim.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(claim.claimedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {claim.status !== 'picked_up' && claim.status !== 'consumed' && (
                        <div className="ml-4 pl-4 border-l border-border/50">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 rounded-lg text-[10px] font-bold border-primary/30 text-primary hover:bg-primary/5"
                            onClick={() => handleUpdateClaimStatus(claim)}
                          >
                            {claim.partnerType === 'restaurant' ? 'Mark Shared' : 'Mark Recieved'}
                          </Button>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )
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

      {/* Claim Confirmation Modal */}
      <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border/50 shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <div className="p-6">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Confirm Your Claim
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Choose how you'd like to receive "<span className="text-foreground font-bold">{selectedListing?.name}</span>" from {selectedListing?.partner.organizationName || selectedListing?.partner.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</span>
                  <span className="font-bold text-lg text-primary">
                    {claimQuantities[selectedListing?._id || ''] || 1} {selectedListing?.unit || 'units'}
                  </span>
                </div>
                
                <h4 className="text-sm font-bold mb-3">Fulfillment Selection</h4>
                <RadioGroup 
                  value={fulfillmentMethod} 
                  onValueChange={(v) => setFulfillmentMethod(v as any)}
                  className="grid gap-3"
                >
                  <label 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                      fulfillmentMethod === 'pickup' 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border/50 bg-background hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                        fulfillmentMethod === 'pickup' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Self Pickup</p>
                        <p className="text-xs text-muted-foreground">You will collect from the partner</p>
                      </div>
                    </div>
                    <RadioGroupItem value="pickup" className="sr-only" />
                    {fulfillmentMethod === 'pickup' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </label>

                  <label 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                      fulfillmentMethod === 'delivery' 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border/50 bg-background hover:border-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                        fulfillmentMethod === 'delivery' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <Navigation className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Request Delivery</p>
                        <p className="text-xs text-muted-foreground">Partner will bring it to you</p>
                      </div>
                    </div>
                    <RadioGroupItem value="delivery" className="sr-only" />
                    {fulfillmentMethod === 'delivery' && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </label>
                </RadioGroup>
              </div>

              {fulfillmentMethod === 'delivery' && (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                  <p className="text-xs text-orange-700 font-medium leading-relaxed">
                    <AlertCircle className="h-3 w-3 inline mr-1 mb-0.5" />
                    Delivery is subject to the partner's availability. They will see your request upon confirmation.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="mt-8 flex flex-row gap-3">
              <Button 
                variant="outline" 
                className="flex-1 rounded-xl font-bold h-12"
                onClick={() => setIsClaimModalOpen(false)}
                disabled={isClaiming}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold h-12 shadow-lg shadow-primary/20"
                onClick={handleClaim}
                disabled={isClaiming}
              >
                {isClaiming ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Confirm Claim
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}