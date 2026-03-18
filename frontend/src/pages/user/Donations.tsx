import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Heart,
  MapPin,
  Clock,
  Plus,
  Check,
  Package,
  AlertCircle,
  Calendar,
  Navigation,
  Search,
  Utensils,
  Handshake,
  TrendingUp,
  History,
  MessageSquare,
  Building2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConnectNGOs from "../restaurants/ConnectNGO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type DonationStatus = "available" | "claimed" | "picked_up";

interface DonationRecord {
  _id: string;
  donor?: string | { _id?: string; id?: string };
  restaurantName: string;
  foodDescription: string;
  quantity: string;
  quantityAvailable?: number;
  unit?: string;
  pickupLocation?: {
    address?: string;
  };
  availableUntil: string;
  status: DonationStatus;
  createdAt: string;
}

interface DonationView {
  id: string;
  donorId?: string;
  restaurantName: string;
  foodDescription: string;
  quantity: string;
  pickupLocation: string;
  availableUntil: string;
  status: DonationStatus;
  createdAt: string;
  quantityAvailable?: number;
  unit?: string;
}

const foodCategories = [
  { id: "all", label: "All", icon: "🍽️" },
  { id: "cooked", label: "Cooked Food", icon: "🍛" },
  { id: "bakery", label: "Bakery", icon: "🍞" },
  { id: "vegetables", label: "Vegetables", icon: "🥗" },
  { id: "fruits", label: "Fruits", icon: "🍎" },
];

const categoryToFoodType: Record<string, string> = {
  cooked: "cooked",
  bakery: "packaged",
  vegetables: "fresh",
  fruits: "fresh",
};

const mapDonation = (donation: DonationRecord): DonationView => {
  const donorId =
    typeof donation.donor === "string"
      ? donation.donor
      : donation.donor?._id || donation.donor?.id;

  return {
    id: donation._id,
    donorId,
    restaurantName: donation.restaurantName,
    foodDescription: donation.foodDescription,
    quantity:
      donation.quantity ||
      `${donation.quantityAvailable ?? 1} ${donation.unit || "portions"}`,
    pickupLocation: donation.pickupLocation?.address || "Pickup location not provided",
    availableUntil: donation.availableUntil,
    status: donation.status,
    createdAt: donation.createdAt,
    quantityAvailable: donation.quantityAvailable,
    unit: donation.unit,
  };
};

const parseQuantityInput = (quantity: string) => {
  const trimmed = quantity.trim();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

  if (!match) {
    return { quantityAvailable: 1, unit: "portions" };
  }

  return {
    quantityAvailable: Math.max(1, Math.round(Number(match[1]))),
    unit: match[2]?.trim() || "portions",
  };
};

export default function Donations() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("donations");
  const [donations, setDonations] = useState<DonationView[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    restaurantName: user?.organizationName || user?.name || "",
    foodDescription: "",
    quantity: "",
    pickupLocation: user?.address?.fullAddress || "",
    availableUntil: "",
    category: "cooked",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      restaurantName: user?.organizationName || user?.name || "",
      pickupLocation: user?.address?.fullAddress || "",
    }));
  }, [user]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      if (!token) {
        setDonations([]);
        return;
      }

      const response = await axios.get(`${API_URL}/donations/my-donations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const myDonations = (response.data?.data || [])
        .map(mapDonation)
        .sort(
          (a: DonationView, b: DonationView) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setDonations(myDonations);
    } catch (error) {
      console.error("Failed to fetch donations", error);
      toast.error("Failed to load food listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const intervalId = window.setInterval(() => {
      fetchDonations();
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [token]);

  const filteredDonations = useMemo(() => {
    let filtered = donations;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.restaurantName.toLowerCase().includes(query) ||
          d.foodDescription.toLowerCase().includes(query) ||
          d.pickupLocation.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    return filtered;
  }, [donations, searchQuery, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please sign in to create a donation");
      return;
    }

    if (!form.foodDescription || !form.quantity || !form.pickupLocation) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const parsedQuantity = parseQuantityInput(form.quantity);
      const availableUntil = form.availableUntil
        ? new Date(form.availableUntil).toISOString()
        : new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

      const payload = {
        restaurantName:
          form.restaurantName || user?.organizationName || user?.name || "Anonymous Donor",
        foodDescription: form.foodDescription.trim(),
        quantity: form.quantity.trim(),
        quantityAvailable: parsedQuantity.quantityAvailable,
        unit: parsedQuantity.unit,
        foodType: categoryToFoodType[form.category] || "mixed",
        pickupLocation: {
          address: form.pickupLocation.trim(),
        },
        availableUntil,
      };

      const response = await axios.post(`${API_URL}/donations`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        toast.success("Food listed successfully");
        setOpen(false);
        setForm({
          restaurantName: user?.organizationName || user?.name || "",
          foodDescription: "",
          quantity: "",
          pickupLocation: user?.address?.fullAddress || "",
          availableUntil: "",
          category: "cooked",
        });
        fetchDonations();
      }
    } catch (error: any) {
      console.error("Failed to create donation", error);
      toast.error(error.response?.data?.message || "Failed to list food");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestPickup = (item: DonationView) => {
    if (item.donorId && item.donorId === user?.id) {
      toast.info("This is your own listing.");
      return;
    }

    toast.info("NGOs can claim donation listings after connecting with you.");
  };

  const getTimeRemaining = (availableUntil: string) => {
    const now = new Date();
    const until = new Date(availableUntil);
    const diffMs = until.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return diffHours > 0 ? `${diffHours}h ${diffMins}m left` : `${diffMins}m left`;
  };

  const statusConfig = {
    available: {
      color: "bg-green-500/10 text-green-600 border-green-500/20",
      label: "Available",
      icon: Check,
    },
    claimed: {
      color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      label: "Claimed",
      icon: Clock,
    },
    picked_up: {
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      label: "Picked Up",
      icon: Package,
    },
  };

  const stats = {
    available: donations.filter((d) => d.status === "available").length,
    claimed: donations.filter((d) => d.status === "claimed").length,
    total: donations.length,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-8 max-w-7xl mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/10 via-background to-orange-500/10 border border-rose-500/10 p-8 md:p-12 mb-8"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left space-y-4 max-w-2xl">
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 px-3 py-1 text-sm font-medium">
              Community Food Sharing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Reduce Waste, <span className="text-rose-500">Share Love</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              List your surplus food and connect with NGOs who can collect it quickly.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8" onClick={() => setOpen(true)}>
                <Plus className="h-5 w-5 mr-2" /> List Surplus Food
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8" onClick={fetchDonations} disabled={loading}>
                <RefreshCw className={cn("h-5 w-5 mr-2", loading && "animate-spin")} />
                Refresh Listings
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex gap-4">
            <div className="space-y-4 mt-8">
              <Card className="glass-card p-6 border-green-500/20 w-48 transition-transform hover:scale-105">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <h4 className="text-2xl font-bold">{stats.available}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Available Now</p>
              </Card>
              <Card className="glass-card p-6 border-blue-500/20 w-48 transition-transform hover:scale-105">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
                <h4 className="text-2xl font-bold">{donations.filter((d) => d.status === "picked_up").length}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Picked Up</p>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="glass-card p-6 border-orange-500/20 w-48 transition-transform hover:scale-105">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <h4 className="text-2xl font-bold">{stats.claimed}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">In Progress</p>
              </Card>
              <Card className="glass-card p-6 border-rose-500/20 w-48 transition-transform hover:scale-105">
                <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-rose-500" />
                </div>
                <h4 className="text-2xl font-bold">{stats.total}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Listings</p>
              </Card>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
      </motion.div>

      <Tabs defaultValue="donations" onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 border-b border-border/50">
          <TabsList className="bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="donations" className="rounded-lg px-6 data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              <Utensils className="h-4 w-4 mr-2" />
              Food Listings
            </TabsTrigger>
            <TabsTrigger id="ngo-tab" value="ngos" className="rounded-lg px-6 data-[state=active]:bg-rose-500 data-[state=active]:text-white">
              <Handshake className="h-4 w-4 mr-2" />
              Partner NGOs
            </TabsTrigger>
          </TabsList>

          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-rose-500">
              <History className="h-4 w-4 mr-2" /> History
            </Button>
            <div className="h-4 w-px bg-border/50 mx-2" />
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-rose-500">
              <MessageSquare className="h-4 w-4 mr-2" /> My Chats
            </Button>
          </div>
        </div>

        <TabsContent value="donations" className="space-y-8 focus-visible:outline-none mt-0">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings by donor, food, or location"
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="claimed">Claimed</option>
              <option value="picked_up">Picked up</option>
            </select>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              Loading food listings...
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredDonations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center"
                  >
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
                      <Search className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Try adjusting your filters or add a new surplus-food listing.
                    </p>
                    <Button variant="link" className="text-rose-500 mt-4" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
                      Clear all filters
                    </Button>
                  </motion.div>
                ) : (
                  filteredDonations.map((item, i) => {
                    const StatusIcon = statusConfig[item.status]?.icon || AlertCircle;
                    const isAvailable = item.status === "available";
                    const isOwnListing = item.donorId === user?.id;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                      >
                        <Card
                          className={cn(
                            "group relative h-full flex flex-col overflow-hidden border-border/50 transition-all hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/5",
                            !isAvailable && "opacity-80"
                          )}
                        >
                          <div className="h-32 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center relative">
                            <div className="h-16 w-16 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                              <span className="text-3xl">
                                {foodCategories.find((c) => item.foodDescription.toLowerCase().includes(c.id))?.icon || "🍱"}
                              </span>
                            </div>

                            <div className="absolute top-4 right-4 flex gap-2">
                              {isOwnListing && (
                                <Badge className="px-3 py-1 shadow-sm bg-rose-500/10 text-rose-600 border-rose-500/20">
                                  Your Listing
                                </Badge>
                              )}
                              <Badge className={cn("px-3 py-1 shadow-sm", statusConfig[item.status]?.color || "bg-muted")}>
                                <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                                {statusConfig[item.status]?.label || "Unknown"}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-6 flex-1 flex flex-col">
                            <div className="mb-4">
                              <h3 className="text-lg font-bold text-foreground group-hover:text-rose-500 transition-colors line-clamp-1">
                                {item.restaurantName}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold mt-1">
                                <Clock className="h-3.5 w-3.5" />
                                {getTimeRemaining(item.availableUntil)}
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                              {item.foodDescription}
                            </p>

                            <div className="space-y-3 mt-auto">
                              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 text-xs text-muted-foreground border border-border/50">
                                <Package className="h-4 w-4 text-rose-500/70" />
                                <span className="font-medium text-foreground">{item.quantity}</span>
                              </div>
                              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 text-xs text-muted-foreground border border-border/50">
                                <MapPin className="h-4 w-4 text-rose-500/70" />
                                <span className="truncate flex-1">{item.pickupLocation}</span>
                              </div>
                            </div>

                            {isAvailable ? (
                              <div className="flex gap-2 mt-6">
                                <Button
                                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20"
                                  onClick={() => handleRequestPickup(item)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  {isOwnListing ? "Your Listing" : "Claim Info"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="rounded-xl shrink-0 border-border/50 hover:bg-rose-500/5 hover:text-rose-500"
                                  onClick={() => toast.info("Opening maps...")}
                                >
                                  <Navigation className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button disabled className="w-full mt-6 rounded-xl bg-muted/50 text-muted-foreground border-border/50">
                                {item.status === "claimed" ? "Waiting for Pickup" : "Already Picked Up"}
                              </Button>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ngos" className="focus-visible:outline-none mt-0">
          <ConnectNGOs hideBackBtn={true} />
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-rose-500/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-rose-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">Share Surplus Food</DialogTitle>
            <p className="text-muted-foreground">Create a donation that will be saved to the backend and shown in food listings.</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Donor Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={form.restaurantName}
                    onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                    placeholder="Individual or organization name"
                    className="pl-10 h-11 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border/50 bg-muted/30 text-sm outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  {foodCategories.slice(1).map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Description *</Label>
              <Textarea
                value={form.foodDescription}
                onChange={(e) => setForm({ ...form, foodDescription: e.target.value })}
                placeholder="What food are you donating? Example: 10 portions of fresh veg pulao"
                className="bg-muted/30 border-border/50 rounded-xl min-h-[100px]"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Quantity *</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="e.g. 5 kg, 10 meals"
                    className="pl-10 h-11 bg-muted/30 border-border/50 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Available Until</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="datetime-local"
                    value={form.availableUntil}
                    onChange={(e) => setForm({ ...form, availableUntil: e.target.value })}
                    className="pl-10 h-11 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Pickup Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  value={form.pickupLocation}
                  onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                  placeholder="Where should it be picked up from?"
                  className="pl-10 bg-muted/30 border-border/50 rounded-xl min-h-[80px]"
                  required
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" variant="ghost" className="rounded-xl flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl flex-1 h-11">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  "Share Now"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
