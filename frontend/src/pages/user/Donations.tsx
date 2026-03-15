import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  MapPin, 
  Clock, 
  Plus, 
  Check, 
  Package, 
  AlertCircle,
  Calendar,
  Phone,
  Navigation,
  Filter,
  Search,
  ChevronDown,
  Utensils,
  Info,
  Handshake,
  ArrowRight,
  TrendingUp,
  History,
  MessageSquare,
  Building2,
} from "lucide-react";
import { getDonations, addDonation } from "@/lib/storage";
import { DonationItem } from "@/types/food";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConnectNGOs from "../restaurants/ConnectNGO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const SAMPLE_DONATIONS: Omit<DonationItem, "id" | "createdAt">[] = [
  {
    restaurantName: "Green Bowl Café",
    foodDescription: "20 mixed salad bowls, fresh from today",
    quantity: "20 bowls",
    pickupLocation: "123 Main St, Downtown",
    availableUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: "available",
  },
  {
    restaurantName: "Bread & Butter Bakery",
    foodDescription: "Assorted bread loaves and pastries",
    quantity: "15 items",
    pickupLocation: "456 Oak Ave",
    availableUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: "available",
  },
  {
    restaurantName: "Spice Garden Restaurant",
    foodDescription: "Dal Makhani with Rice - freshly prepared",
    quantity: "30 portions",
    pickupLocation: "789 MG Road, Koramangala",
    availableUntil: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    status: "available",
  },
];

const foodCategories = [
  { id: "all", label: "All", icon: "🍽️" },
  { id: "cooked", label: "Cooked Food", icon: "🍛" },
  { id: "bakery", label: "Bakery", icon: "🍞" },
  { id: "vegetables", label: "Vegetables", icon: "🥗" },
  { id: "fruits", label: "Fruits", icon: "🍎" },
];

export default function Donations() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("donations");
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<DonationItem[]>([]);
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
    let items = getDonations();
    if (items.length === 0) {
      SAMPLE_DONATIONS.forEach((d) => addDonation(d));
      items = getDonations();
    }
    setDonations(items);
    setFilteredDonations(items);
  }, []);

  useEffect(() => {
    let filtered = donations;
    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.foodDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }
    setFilteredDonations(filtered);
  }, [searchQuery, statusFilter, donations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.foodDescription || !form.quantity) {
      toast.error("Please fill in required fields");
      return;
    }
    addDonation({ 
      ...form, 
      restaurantName: form.restaurantName || user?.name || "Anonymous Donor",
      availableUntil: form.availableUntil || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), 
      status: "available" 
    });
    setDonations(getDonations());
    setOpen(false);
    setForm({ 
      restaurantName: user?.organizationName || user?.name || "", 
      foodDescription: "", 
      quantity: "", 
      pickupLocation: user?.address?.fullAddress || "", 
      availableUntil: "",
      category: "cooked",
    });
    toast.success("Food listed for donation!");
  };

  const handleRequestPickup = (item: DonationItem) => {
    toast.success(`Pickup request sent to ${item.restaurantName}!`, {
      description: "They will contact you shortly with pickup details.",
    });
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
      icon: Check 
    },
    claimed: { 
      color: "bg-orange-500/10 text-orange-600 border-orange-500/20", 
      label: "Claimed",
      icon: Clock 
    },
    picked_up: { 
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20", 
      label: "Picked Up",
      icon: Package 
    },
  };

  const stats = {
    available: donations.filter(d => d.status === "available").length,
    claimed: donations.filter(d => d.status === "claimed").length,
    total: donations.length
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] space-y-8 max-w-7xl mx-auto pb-12">
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TOP HERO SECTION */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
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
              Connect with local NGOs and community members to donate your surplus food. 
              Join over {donations.length + 10} donors making a difference today.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8" onClick={() => setOpen(true)}>
                <Plus className="h-5 w-5 mr-2" /> List Surplus Food
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
                <h4 className="text-2xl font-bold">{donations.filter(d => d.status === "picked_up").length || 12}</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Saved Meals</p>
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
                <h4 className="text-2xl font-bold">4.9</h4>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Donor Rating</p>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Background elements */}
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

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* DONATIONS TAB */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="donations" className="space-y-8 focus-visible:outline-none mt-0">
          

          {/* Listings Grid */}
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
                    Try adjusting your filters or search keywords to find more food donations in your area.
                  </p>
                  <Button variant="link" className="text-rose-500 mt-4" onClick={() => {setSearchQuery(""); setStatusFilter("all");}}>
                    Clear all filters
                  </Button>
                </motion.div>
              ) : (
                filteredDonations.map((item, i) => {
                  const StatusIcon = statusConfig[item.status]?.icon || AlertCircle;
                  const isAvailable = item.status === "available";
                  
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                    >
                      <Card className={cn(
                        "group relative h-full flex flex-col overflow-hidden border-border/50 transition-all hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/5",
                        !isAvailable && "opacity-80"
                      )}>
                        {/* Header Image Placeholder / Icon */}
                        <div className="h-32 bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center relative">
                          <div className="h-16 w-16 rounded-2xl bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <span className="text-3xl">
                              {foodCategories.find(c => c.id === (item as any).category)?.icon || "🍱"}
                            </span>
                          </div>
                          
                          {/* Floating Badge */}
                          <div className="absolute top-4 right-4">
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
                                Claim Food
                              </Button>
                              <Button variant="outline" size="icon" className="rounded-xl shrink-0 border-border/50 hover:bg-rose-500/5 hover:text-rose-500" onClick={() => toast.info("Opening maps...")}>
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
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* NGO CONNECT TAB */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="ngos" className="focus-visible:outline-none mt-0">
          <ConnectNGOs hideBackBtn={true} />
        </TabsContent>
      </Tabs>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* LIST FOOD DIALOG */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-rose-500/10 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-rose-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">Share Surplus Food</DialogTitle>
            <p className="text-muted-foreground">List your extra food to help someone in need.</p>
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
                    placeholder="Individual or Org Name"
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
                  {foodCategories.slice(1).map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Description *</Label>
              <Textarea 
                value={form.foodDescription} 
                onChange={(e) => setForm({ ...form, foodDescription: e.target.value })} 
                placeholder="What food are you donating? (e.g. 10 portions of healthy veg pasta)"
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
              <Button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl flex-1 h-11">
                Share Now
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}