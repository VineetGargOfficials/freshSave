// src/pages/restaurants/ConnectNGOs.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Heart,
  Building2,
  CheckCircle2,
  Clock,
  Truck,
  Thermometer,
  Send,
  MessageSquare,
  Loader2,
  RefreshCw,
  ExternalLink,
  Package,
  HandHeart,
  UserCheck,
  AlertCircle,
  Info,
  X,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface NGO {
  _id?: string;
  id?: string;
  name?: string;
  email: string;
  phoneNumber?: string;
  organizationName: string;
  ngoType: string;
  ngoRegistrationNumber?: string;
  address?: {
    city?: string;
    state?: string;
    fullAddress?: string;
  };
  beneficiaryTypes?: string[];
  dailyBeneficiaries?: number;
  totalBeneficiaries?: number;
  hasPickupVehicle?: boolean;
  pickupRadius?: number;
  hasRefrigeration?: boolean;
  storageCapacityKg?: number;
  preferredFoodTypes?: string[];
  organizationDescription?: string;
  foundedYear?: number;
  website?: string;
  isVerified?: boolean;
  connectionStatus?: "none" | "pending" | "accepted" | "rejected";
}

// ── Mock Data (Fallback) ─────────────────────────────────────────────────────────────
const MOCK_NGOS: NGO[] = [
  {
    _id: "1",
    name: "Ramesh Kumar",
    email: "contact@hopefoundation.org",
    phoneNumber: "+91 98765 43210",
    organizationName: "Hope Foundation",
    ngoType: "orphanage",
    ngoRegistrationNumber: "NGO/2015/MH/001",
    address: { city: "Mumbai", state: "Maharashtra", fullAddress: "123 Hope Street, Andheri West, Mumbai 400053" },
    beneficiaryTypes: ["children", "homeless"],
    dailyBeneficiaries: 150,
    totalBeneficiaries: 200,
    hasPickupVehicle: true,
    pickupRadius: 15,
    hasRefrigeration: true,
    storageCapacityKg: 200,
    preferredFoodTypes: ["Cooked meals", "Rice", "Vegetables"],
    organizationDescription: "Hope Foundation has been serving orphaned and underprivileged children since 2015. We provide shelter, education, and nutritious meals to over 200 children.",
    foundedYear: 2015,
    website: "https://hopefoundation.org",
    isVerified: true,
    connectionStatus: "accepted",
  },
  {
    _id: "2",
    name: "Priya Sharma",
    email: "info@communitykitchen.org",
    phoneNumber: "+91 98765 12345",
    organizationName: "Community Kitchen Mumbai",
    ngoType: "community_kitchen",
    address: { city: "Mumbai", state: "Maharashtra", fullAddress: "456 Service Road, Bandra, Mumbai" },
    beneficiaryTypes: ["homeless", "elderly", "general_public"],
    dailyBeneficiaries: 500,
    totalBeneficiaries: 500,
    hasPickupVehicle: true,
    pickupRadius: 20,
    hasRefrigeration: true,
    storageCapacityKg: 500,
    preferredFoodTypes: ["All types of food"],
    organizationDescription: "We serve hot meals to homeless and underprivileged people across Mumbai. Our kitchen operates 365 days a year.",
    foundedYear: 2018,
    isVerified: true,
    connectionStatus: "pending",
  },
  {
    _id: "3",
    name: "Suresh Patel",
    email: "care@sunshineelders.org",
    phoneNumber: "+91 98123 45678",
    organizationName: "Sunshine Old Age Home",
    ngoType: "old_age_home",
    address: { city: "Pune", state: "Maharashtra", fullAddress: "789 Peace Colony, Kothrud, Pune" },
    beneficiaryTypes: ["elderly"],
    dailyBeneficiaries: 80,
    totalBeneficiaries: 80,
    hasPickupVehicle: false,
    hasRefrigeration: true,
    storageCapacityKg: 100,
    preferredFoodTypes: ["Soft foods", "Fruits", "Dairy"],
    organizationDescription: "Sunshine Old Age Home provides loving care to 80 senior citizens. We focus on their health and happiness.",
    foundedYear: 2010,
    isVerified: true,
    connectionStatus: "none",
  },
  {
    _id: "4",
    name: "Anjali Desai",
    email: "hello@feedingindia.org",
    phoneNumber: "+91 99887 66554",
    organizationName: "Feeding India Foundation",
    ngoType: "food_bank",
    address: { city: "Delhi", state: "Delhi", fullAddress: "101 Charity Lane, Connaught Place, New Delhi" },
    beneficiaryTypes: ["children", "homeless", "general_public"],
    dailyBeneficiaries: 1000,
    totalBeneficiaries: 5000,
    hasPickupVehicle: true,
    pickupRadius: 30,
    hasRefrigeration: true,
    storageCapacityKg: 1000,
    preferredFoodTypes: ["All types"],
    organizationDescription: "India's largest food bank network. We rescue surplus food and distribute it to those in need.",
    foundedYear: 2014,
    website: "https://feedingindia.org",
    isVerified: true,
    connectionStatus: "none",
  },
  {
    _id: "5",
    name: "Mohammed Ali",
    email: "contact@shelterHome.org",
    organizationName: "Safe Shelter Home",
    ngoType: "shelter",
    address: { city: "Bangalore", state: "Karnataka" },
    beneficiaryTypes: ["homeless", "refugees"],
    dailyBeneficiaries: 120,
    totalBeneficiaries: 150,
    hasPickupVehicle: false,
    hasRefrigeration: false,
    organizationDescription: "Providing temporary shelter and meals to homeless individuals and refugees.",
    foundedYear: 2019,
    isVerified: false,
    connectionStatus: "none",
  },
  {
    _id: "6",
    name: "Kavita Reddy",
    email: "info@pawscare.org",
    phoneNumber: "+91 98765 99999",
    organizationName: "Paws & Care Animal Shelter",
    ngoType: "animal_shelter",
    address: { city: "Hyderabad", state: "Telangana", fullAddress: "Green Valley Road, Secunderabad" },
    beneficiaryTypes: ["animals"],
    dailyBeneficiaries: 200,
    totalBeneficiaries: 300,
    hasPickupVehicle: true,
    pickupRadius: 25,
    hasRefrigeration: true,
    storageCapacityKg: 150,
    preferredFoodTypes: ["Vegetable scraps", "Rice", "Bread"],
    organizationDescription: "We rescue and rehabilitate stray animals. Surplus food helps feed our 300+ rescued animals.",
    foundedYear: 2016,
    isVerified: true,
    connectionStatus: "rejected",
  },
];

// ── Constants ─────────────────────────────────────────────────────────────────
const NGO_TYPES = [
  { value: "all", label: "All Types" },
  { value: "orphanage", label: "Orphanage" },
  { value: "old_age_home", label: "Old Age Home" },
  { value: "shelter", label: "Shelter Home" },
  { value: "food_bank", label: "Food Bank" },
  { value: "community_kitchen", label: "Community Kitchen" },
  { value: "hospital", label: "Hospital / Clinic" },
  { value: "animal_shelter", label: "Animal Shelter" },
  { value: "other", label: "Other" },
];

const BENEFICIARY_ICONS: Record<string, string> = {
  children: "👧",
  elderly: "👴",
  homeless: "🏠",
  disabled: "♿",
  refugees: "🌍",
  animals: "🐾",
  general_public: "👥",
};

const NGO_TYPE_ICONS: Record<string, string> = {
  orphanage: "🏠",
  old_age_home: "👴",
  shelter: "🛖",
  food_bank: "🏦",
  community_kitchen: "🍳",
  hospital: "🏥",
  animal_shelter: "🐾",
  other: "🤝",
};

export default function ConnectNGOs() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ngoTypeFilter, setNgoTypeFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchRadius, setSearchRadius] = useState("10");

  useEffect(() => {
    fetchNGOs();
  }, [user, searchRadius, ngoTypeFilter]);

  const fetchNGOs = async () => {
    setLoading(true);
    try {
      const restaurantCity  = user?.address?.city  || '';
      const restaurantState = user?.address?.state || '';

      const params: any = {
        radius: searchRadius,
      };

      if (restaurantCity)  params.city  = restaurantCity;
      if (restaurantState) params.state = restaurantState;
      if (ngoTypeFilter !== 'all') params.type = ngoTypeFilter;

      console.log('[ConnectNGO] Fetching with params:', params);

      const res = await axios.get(`${API_URL}/ngos/nearby`, { params });
      if (res.data.success) {
        setNgos(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch NGOs", error);
      toast.error("Failed to fetch NGOs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Modal states
  const [selectedNGO, setSelectedNGO] = useState<NGO | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMessage, setConnectMessage] = useState("");
  const [connecting, setConnecting] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"discover" | "connections">("discover");

  // ── Filter NGOs ─────────────────────────────────────────────────────────────
  const filteredNGOs = ngos.filter((ngo) => {
    const matchesSearch =
      ngo.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = ngoTypeFilter === "all" || ngo.ngoType === ngoTypeFilter;
    const matchesCity = !cityFilter || ngo.address?.city?.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesVerified = !verifiedOnly || ngo.isVerified;

    return matchesSearch && matchesType && matchesCity && matchesVerified;
  });

  // ── Connections ─────────────────────────────────────────────────────────────
  const connectedNGOs = ngos.filter((n) => n.connectionStatus === "accepted");
  const pendingNGOs = ngos.filter((n) => n.connectionStatus === "pending");
  const rejectedNGOs = ngos.filter((n) => n.connectionStatus === "rejected");

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    totalNGOs: ngos.length,
    verifiedNGOs: ngos.filter((n) => n.isVerified).length,
    connectedNGOs: connectedNGOs.length,
    pendingRequests: pendingNGOs.length,
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    fetchNGOs();
  };

  const openDetailsModal = (ngo: NGO) => {
    setSelectedNGO(ngo);
    setShowDetailsModal(true);
  };

  const openConnectModal = (ngo: NGO) => {
    setSelectedNGO(ngo);
    setShowConnectModal(true);
  };

  const handleConnect = () => {
    if (!selectedNGO) return;
    setConnecting(true);
    
    // Simulate API call
    setTimeout(() => {
      setNgos((prev) =>
        prev.map((n) =>
          ((n._id && n._id === selectedNGO?._id) || (n.id && n.id === selectedNGO?.id)) ? { ...n, connectionStatus: "pending" as const } : n
        )
      );
      setConnecting(false);
      setShowConnectModal(false);
      setConnectMessage("");
      toast.success(`Connection request sent to ${selectedNGO.organizationName}!`);
    }, 1500);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setNgoTypeFilter("all");
    setCityFilter("");
    setVerifiedOnly(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/restaurant")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <HandHeart className="h-8 w-8 text-rose-500" />
              Connect with NGOs
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover and partner with organizations to donate your surplus food
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Total NGOs", value: stats.totalNGOs, icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Verified", value: stats.verifiedNGOs, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Connected", value: stats.connectedNGOs, icon: UserCheck, color: "text-rose-500", bg: "bg-rose-500/10" },
          { label: "Pending", value: stats.pendingRequests, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2"
      >
        <Button
          variant={activeTab === "discover" ? "default" : "outline"}
          onClick={() => setActiveTab("discover")}
          className={activeTab === "discover" ? "bg-rose-500 hover:bg-rose-600" : ""}
        >
          <Search className="h-4 w-4 mr-2" />
          Discover NGOs
        </Button>
        <Button
          variant={activeTab === "connections" ? "default" : "outline"}
          onClick={() => setActiveTab("connections")}
          className={activeTab === "connections" ? "bg-rose-500 hover:bg-rose-600" : ""}
        >
          <Users className="h-4 w-4 mr-2" />
          My Connections
          {stats.pendingRequests > 0 && (
            <Badge className="ml-2 bg-orange-500 text-white">{stats.pendingRequests}</Badge>
          )}
        </Button>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DISCOVER TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "discover" && (
        <>
          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, organization, or city..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <Select value={ngoTypeFilter} onValueChange={setNgoTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="NGO Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {NGO_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={searchRadius} onValueChange={setSearchRadius}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Radius" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Filter by city..."
                    className="w-[150px]"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  />

                  <Button
                    variant={verifiedOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={verifiedOnly ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Verified Only
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="hover:bg-rose-500/10 text-rose-500 hover:text-rose-600"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                    Refresh Results
                  </Button>

                  {(user?.address?.city || user?.address?.state) && (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 text-xs font-medium ml-auto">
                      <MapPin className="h-3 w-3" />
                      Searching from: {[user?.address?.city, user?.address?.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* NGO Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
                <span className="ml-3 text-muted-foreground">Loading NGOs...</span>
              </div>
            ) : filteredNGOs.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No NGOs Found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filters
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredNGOs.map((ngo, index) => (
                    <motion.div
                      key={ngo._id || ngo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-card p-5 h-full flex flex-col hover:shadow-lg transition-all hover:border-rose-500/30">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="h-14 w-14 rounded-xl bg-rose-500/10 flex items-center justify-center text-2xl shrink-0">
                            {NGO_TYPE_ICONS[ngo.ngoType] || "🤝"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground truncate">
                                {ngo.organizationName}
                              </h3>
                              {ngo.isVerified && (
                                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {ngo.ngoType?.replace(/_/g, " ")}
                            </p>
                            {ngo.address?.city && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {ngo.address.city}
                                {ngo.address.state && `, ${ngo.address.state}`}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {ngo.organizationDescription && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {ngo.organizationDescription}
                          </p>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {ngo.dailyBeneficiaries && (
                            <div className="p-2 rounded-lg bg-muted/30 text-center">
                              <p className="text-lg font-bold text-foreground">{ngo.dailyBeneficiaries}</p>
                              <p className="text-xs text-muted-foreground">Meals/Day</p>
                            </div>
                          )}
                          {ngo.totalBeneficiaries && (
                            <div className="p-2 rounded-lg bg-muted/30 text-center">
                              <p className="text-lg font-bold text-foreground">{ngo.totalBeneficiaries}</p>
                              <p className="text-xs text-muted-foreground">Beneficiaries</p>
                            </div>
                          )}
                        </div>

                        {/* Beneficiary Types */}
                        {ngo.beneficiaryTypes && ngo.beneficiaryTypes.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">Serves:</p>
                            <div className="flex flex-wrap gap-1">
                              {ngo.beneficiaryTypes.slice(0, 4).map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {BENEFICIARY_ICONS[type] || "📦"} {type.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Capabilities */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {ngo.hasPickupVehicle && (
                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20">
                              <Truck className="h-3 w-3 mr-1" />
                              Has Vehicle
                            </Badge>
                          )}
                          {ngo.hasRefrigeration && (
                            <Badge variant="outline" className="text-xs bg-cyan-500/10 text-cyan-600 border-cyan-500/20">
                              <Thermometer className="h-3 w-3 mr-1" />
                              Refrigeration
                            </Badge>
                          )}
                          {ngo.pickupRadius && (
                            <Badge variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {ngo.pickupRadius} km
                            </Badge>
                          )}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto pt-4 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openDetailsModal(ngo)}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Details
                          </Button>

                          {ngo.connectionStatus === "accepted" ? (
                            <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600" disabled>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Connected
                            </Button>
                          ) : ngo.connectionStatus === "pending" ? (
                            <Button size="sm" variant="outline" className="flex-1 text-orange-500 border-orange-500/30" disabled>
                              <Clock className="h-4 w-4 mr-1" />
                              Pending
                            </Button>
                          ) : ngo.connectionStatus === "rejected" ? (
                            <Button size="sm" variant="outline" className="flex-1 text-red-500 border-red-500/30" disabled>
                              <X className="h-4 w-4 mr-1" />
                              Declined
                            </Button>
                          ) : (
                            <Button size="sm" className="flex-1 bg-rose-500 hover:bg-rose-600" onClick={() => openConnectModal(ngo)}>
                              <Heart className="h-4 w-4 mr-1" />
                              Connect
                            </Button>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CONNECTIONS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "connections" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {connectedNGOs.length === 0 && pendingNGOs.length === 0 && rejectedNGOs.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Connections Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start connecting with NGOs to donate your surplus food
              </p>
              <Button onClick={() => setActiveTab("discover")} className="bg-rose-500 hover:bg-rose-600">
                <Search className="h-4 w-4 mr-2" />
                Discover NGOs
              </Button>
            </Card>
          ) : (
            <>
              {/* Active Partners */}
              {connectedNGOs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Active Partners ({connectedNGOs.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {connectedNGOs.map((ngo) => (
                      <Card key={ngo._id || ngo.id} className="glass-card p-4 border-green-500/20">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-xl">
                            {NGO_TYPE_ICONS[ngo.ngoType] || "🤝"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{ngo.organizationName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {ngo.address?.city || "Location not specified"}
                            </p>
                            <p className="text-xs text-green-600">Connected</p>
                          </div>
                          <div className="flex gap-2">
                            {ngo.phoneNumber && (
                              <Button variant="outline" size="icon" asChild>
                                <a href={`tel:${ngo.phoneNumber}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button variant="outline" size="icon" asChild>
                              <a href={`mailto:${ngo.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => openDetailsModal(ngo)}>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Requests */}
              {pendingNGOs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Pending Requests ({pendingNGOs.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {pendingNGOs.map((ngo) => (
                      <Card key={ngo._id || ngo.id} className="glass-card p-4 border-orange-500/20">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                            {NGO_TYPE_ICONS[ngo.ngoType] || "🤝"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{ngo.organizationName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {ngo.address?.city || "Location not specified"}
                            </p>
                            <p className="text-xs text-orange-600">Awaiting response</p>
                          </div>
                          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Declined */}
              {rejectedNGOs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    Declined ({rejectedNGOs.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {rejectedNGOs.map((ngo) => (
                      <Card key={ngo._id || ngo.id} className="glass-card p-4 border-red-500/20 opacity-60">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-xl">
                            {NGO_TYPE_ICONS[ngo.ngoType] || "🤝"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate">{ngo.organizationName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {ngo.address?.city || "Location not specified"}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-red-500 border-red-500/30">
                            Declined
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* NGO DETAILS MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNGO && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-rose-500/10 flex items-center justify-center text-3xl">
                    {NGO_TYPE_ICONS[selectedNGO.ngoType] || "🤝"}
                  </div>
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      {selectedNGO.organizationName}
                      {selectedNGO.isVerified && (
                        <Badge className="bg-green-500/10 text-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="capitalize">
                      {selectedNGO.ngoType?.replace(/_/g, " ")}
                      {selectedNGO.foundedYear && ` • Est. ${selectedNGO.foundedYear}`}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Description */}
                {selectedNGO.organizationDescription && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">About</h4>
                    <p className="text-muted-foreground">{selectedNGO.organizationDescription}</p>
                  </div>
                )}

                {/* Contact Info */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Contact Information</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedNGO.email}</span>
                    </div>
                    {selectedNGO.phoneNumber && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedNGO.phoneNumber}</span>
                      </div>
                    )}
                    {selectedNGO.website && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={selectedNGO.website} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate">
                          {selectedNGO.website}
                        </a>
                      </div>
                    )}
                    {selectedNGO.address?.fullAddress && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 sm:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm">{selectedNGO.address.fullAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Impact & Capacity</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedNGO.dailyBeneficiaries && (
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="text-xl font-bold text-foreground">{selectedNGO.dailyBeneficiaries}</p>
                        <p className="text-xs text-muted-foreground">Meals/Day</p>
                      </div>
                    )}
                    {selectedNGO.totalBeneficiaries && (
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="text-xl font-bold text-foreground">{selectedNGO.totalBeneficiaries}</p>
                        <p className="text-xs text-muted-foreground">Beneficiaries</p>
                      </div>
                    )}
                    {selectedNGO.storageCapacityKg && (
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="text-xl font-bold text-foreground">{selectedNGO.storageCapacityKg} kg</p>
                        <p className="text-xs text-muted-foreground">Storage</p>
                      </div>
                    )}
                    {selectedNGO.pickupRadius && (
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="text-xl font-bold text-foreground">{selectedNGO.pickupRadius} km</p>
                        <p className="text-xs text-muted-foreground">Pickup Radius</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Beneficiaries */}
                {selectedNGO.beneficiaryTypes && selectedNGO.beneficiaryTypes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Who They Serve</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNGO.beneficiaryTypes.map((type) => (
                        <Badge key={type} variant="outline" className="py-1.5">
                          {BENEFICIARY_ICONS[type] || "📦"} {type.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNGO.hasPickupVehicle && (
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 py-1.5">
                        <Truck className="h-4 w-4 mr-1" />
                        Has Pickup Vehicle
                      </Badge>
                    )}
                    {selectedNGO.hasRefrigeration && (
                      <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 py-1.5">
                        <Thermometer className="h-4 w-4 mr-1" />
                        Has Refrigeration
                      </Badge>
                    )}
                    {!selectedNGO.hasPickupVehicle && !selectedNGO.hasRefrigeration && (
                      <p className="text-sm text-muted-foreground">No special capabilities listed</p>
                    )}
                  </div>
                </div>

                {/* Preferred Food */}
                {selectedNGO.preferredFoodTypes && selectedNGO.preferredFoodTypes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Preferred Food Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNGO.preferredFoodTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="py-1.5">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                {selectedNGO.connectionStatus === "none" && (
                  <Button
                    className="bg-rose-500 hover:bg-rose-600"
                    onClick={() => {
                      setShowDetailsModal(false);
                      openConnectModal(selectedNGO);
                    }}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CONNECT REQUEST MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showConnectModal} onOpenChange={setShowConnectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Connect with {selectedNGO?.organizationName}
            </DialogTitle>
            <DialogDescription>
              Send a connection request to partner with this NGO for food donations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* NGO Preview */}
            {selectedNGO && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-2xl">
                  {NGO_TYPE_ICONS[selectedNGO.ngoType] || "🤝"}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedNGO.organizationName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedNGO.address?.city || "Location not specified"}
                  </p>
                </div>
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Introduction Message
              </Label>
              <Textarea
                id="message"
                placeholder="Introduce yourself and your restaurant. Let them know about your surplus food and how you'd like to partner..."
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                A good introduction helps NGOs understand your donation capacity.
              </p>
            </div>

            {/* Restaurant Info Preview */}
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-2">
                Your request will include:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Restaurant name: {user?.organizationName || user?.name}</li>
                <li>• Contact email: {user?.email}</li>
                {user?.phoneNumber && <li>• Phone: {user?.phoneNumber}</li>}
              </ul>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowConnectModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}