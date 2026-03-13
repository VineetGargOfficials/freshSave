import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { getDonations, addDonation } from "@/lib/storage";
import { DonationItem } from "@/types/food";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  {
    restaurantName: "Curry House",
    foodDescription: "Vegetable Biryani with Raita",
    quantity: "25 portions",
    pickupLocation: "321 HSR Layout",
    availableUntil: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: "claimed",
  },
  {
    restaurantName: "Fresh Bites Cafe",
    foodDescription: "Sandwiches and wraps",
    quantity: "18 pieces",
    pickupLocation: "555 Indiranagar",
    availableUntil: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
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
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<DonationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [form, setForm] = useState({ 
    restaurantName: "", 
    foodDescription: "", 
    quantity: "", 
    pickupLocation: "", 
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

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.foodDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    setFilteredDonations(filtered);
  }, [searchQuery, statusFilter, donations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.restaurantName || !form.foodDescription) {
      toast.error("Please fill in required fields");
      return;
    }
    addDonation({ 
      ...form, 
      availableUntil: form.availableUntil || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), 
      status: "available" 
    });
    setDonations(getDonations());
    setFilteredDonations(getDonations());
    setOpen(false);
    setForm({ 
      restaurantName: "", 
      foodDescription: "", 
      quantity: "", 
      pickupLocation: "", 
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
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m left`;
    }
    return `${diffMins}m left`;
  };

  const statusConfig = {
    available: { 
      color: "bg-green-500/10 text-green-600 border-green-500/20", 
      label: "Available",
      icon: Check 
    },
    claimed: { 
      color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", 
      label: "Claimed",
      icon: Clock 
    },
    picked_up: { 
      color: "bg-gray-500/10 text-gray-600 border-gray-500/20", 
      label: "Picked Up",
      icon: Package 
    },
  };

  const availableCount = donations.filter(d => d.status === "available").length;
  const claimedCount = donations.filter(d => d.status === "claimed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            Food Donations
          </h1>
          <p className="text-muted-foreground mt-1">
            Share surplus, reduce waste • {availableCount} available now
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> List Food
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>List Surplus Food</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Restaurant / Organization *</Label>
                <Input 
                  value={form.restaurantName} 
                  onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} 
                  placeholder="Your business name" 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Food Category *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {foodCategories.slice(1).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.id })}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                        form.category === cat.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      )}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Food Description *</Label>
                <Textarea 
                  value={form.foodDescription} 
                  onChange={(e) => setForm({ ...form, foodDescription: e.target.value })} 
                  placeholder="Describe the food items available..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input 
                    value={form.quantity} 
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })} 
                    placeholder="e.g. 10 meals, 5 kg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Available Until</Label>
                  <Input 
                    type="datetime-local"
                    value={form.availableUntil} 
                    onChange={(e) => setForm({ ...form, availableUntil: e.target.value })} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pickup Location *</Label>
                <Input 
                  value={form.pickupLocation} 
                  onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })} 
                  placeholder="Full address for pickup"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 gradient-primary text-white">
                  List for Donation
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{availableCount}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{claimedCount}</p>
              <p className="text-xs text-muted-foreground">Claimed</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{donations.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by restaurant, food, or location..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 rounded-lg border border-border bg-background text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="claimed">Claimed</option>
          <option value="picked_up">Picked Up</option>
        </select>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">How it works</h3>
              <p className="text-sm text-muted-foreground">
                Browse available food donations from nearby restaurants. Click "Request Pickup" to claim food items. 
                The restaurant will contact you with pickup details. Remember to pick up within the specified time!
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Donation Listings */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDonations.length === 0 ? (
          <div className="col-span-full">
            <Card className="glass-card p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No donations found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </Card>
          </div>
        ) : (
          filteredDonations.map((item, i) => {
            const StatusIcon = statusConfig[item.status].icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="glass-card p-5 h-full flex flex-col hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Heart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.restaurantName}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {getTimeRemaining(item.availableUntil)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("text-xs", statusConfig[item.status].color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[item.status].label}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground mb-3 flex-1">{item.foodDescription}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      <span>{item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{item.pickupLocation}</span>
                    </div>
                  </div>

                  {item.status === "available" && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => handleRequestPickup(item)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Request Pickup
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Navigation feature coming soon!")}
                      >
                        <Navigation className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Contact feature coming soon!")}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  {item.status === "claimed" && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Badge variant="outline" className="w-full justify-center py-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Claimed - Pickup pending
                      </Badge>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}