// src/pages/restaurants/ListFood.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  Clock,
  MapPin,
  Package,
  Utensils,
  MessageSquare,
  Timer,
  X,
  CheckCircle2,
  ImagePlus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";

const foodCategories = [
  { id: "cooked", label: "Cooked Food", icon: "🍛" },
  { id: "raw", label: "Raw Vegetables", icon: "🥬" },
  { id: "packaged", label: "Packaged Items", icon: "📦" },
  { id: "bakery", label: "Bakery", icon: "🍞" },
  { id: "dairy", label: "Dairy Products", icon: "🥛" },
  { id: "fruits", label: "Fruits", icon: "🍎" },
];

const recentListings = [
  {
    id: 1,
    name: "Vegetable Biryani",
    quantity: "25 portions",
    category: "Cooked Food",
    listedAt: "2 hours ago",
    status: "claimed",
    claimedBy: "Hope Foundation",
  },
  {
    id: 2,
    name: "Fresh Bread Loaves",
    quantity: "40 pieces",
    category: "Bakery",
    listedAt: "5 hours ago",
    status: "picked_up",
    claimedBy: "Community Kitchen",
  },
  {
    id: 3,
    name: "Mixed Fruit Salad",
    quantity: "10 kg",
    category: "Fruits",
    listedAt: "Yesterday",
    status: "picked_up",
    claimedBy: "Care Center",
  },
];

export default function ListFood() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop",
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-8 w-8 text-orange-500" />
            List Surplus Food
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your surplus food with nearby NGOs
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-500/30 bg-green-500/10 w-fit">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          3 NGOs nearby
        </Badge>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6">
            <form className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base">
                  <Camera className="h-4 w-4" />
                  Food Photos
                </Label>
                <div className="flex flex-wrap gap-3">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Food ${index + 1}`}
                        className="h-24 w-24 rounded-lg object-cover border-2 border-border"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="h-24 w-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-orange-500 hover:bg-orange-500/5 transition-colors"
                  >
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add</span>
                  </button>
                </div>
              </div>

              {/* Food Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Food Name *
                  </Label>
                  <Input placeholder="e.g., Vegetable Biryani" defaultValue="Dal Makhani with Rice" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Quantity *
                  </Label>
                  <Input placeholder="e.g., 50 meals, 10 kg" defaultValue="30 portions" />
                </div>
              </div>

              {/* Food Category */}
              <div className="space-y-3">
                <Label>Food Category *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {foodCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                        selectedCategory === cat.id
                          ? "border-orange-500 bg-orange-500/10 text-orange-600"
                          : "border-border hover:border-orange-500/50 hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Description
                </Label>
                <Textarea
                  placeholder="Describe the food items, preparation time, storage conditions, etc."
                  rows={3}
                  defaultValue="Freshly prepared dal makhani with steamed basmati rice. Prepared today at 12:00 PM. Stored in food-grade containers at room temperature."
                />
              </div>

              {/* Pickup Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Available Until *
                  </Label>
                  <Input type="datetime-local" defaultValue="2025-01-15T20:00" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Best Consumed Within
                  </Label>
                  <Input placeholder="e.g., 4 hours" defaultValue="6 hours" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pickup Location *
                </Label>
                <Input 
                  placeholder="Your restaurant address" 
                  defaultValue={user?.address || "123 Main Street, Koramangala, Bangalore - 560034"}
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  3 verified NGOs within 5 km will be notified
                </p>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <Label>Additional Options</Label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    <div>
                      <span className="text-sm font-medium">Refrigeration available</span>
                      <p className="text-xs text-muted-foreground">Food can be stored cold</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    <div>
                      <span className="text-sm font-medium">Immediate pickup needed</span>
                      <p className="text-xs text-muted-foreground">Food expires soon</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    <div>
                      <span className="text-sm font-medium">Containers provided</span>
                      <p className="text-xs text-muted-foreground">NGO doesn't need to bring</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                    <div>
                      <span className="text-sm font-medium">Vegetarian only</span>
                      <p className="text-xs text-muted-foreground">100% vegetarian food</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white h-12"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  List Food for Donation
                </Button>
                <Button type="button" variant="outline" className="h-12">
                  Save Draft
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick Stats */}
          <Card className="glass-card p-4">
            <h3 className="font-semibold text-foreground mb-3">Your Impact</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Listings</span>
                <span className="font-semibold text-foreground">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meals Donated</span>
                <span className="font-semibold text-green-600">892</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">NGOs Helped</span>
                <span className="font-semibold text-blue-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Food Saved</span>
                <span className="font-semibold text-orange-600">156 kg</span>
              </div>
            </div>
          </Card>

          {/* Recent Listings */}
          <Card className="glass-card p-4">
            <h3 className="font-semibold text-foreground mb-3">Recent Listings</h3>
            <div className="space-y-3">
              {recentListings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium text-foreground text-sm">{listing.name}</h4>
                    <Badge
                      variant="outline"
                      className={
                        listing.status === "claimed"
                          ? "text-blue-600 border-blue-500/30 bg-blue-500/10 text-xs"
                          : "text-green-600 border-green-500/30 bg-green-500/10 text-xs"
                      }
                    >
                      {listing.status === "claimed" ? "Claimed" : "Picked Up"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{listing.quantity} • {listing.category}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {listing.claimedBy} • {listing.listedAt}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Tips */}
          <Card className="glass-card p-4 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20">
            <h3 className="font-semibold text-foreground mb-3">💡 Tips for Quick Pickups</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Add clear photos of the food
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Specify exact quantity available
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Set realistic pickup windows
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                Keep food properly stored
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}