// src/pages/restaurants/ListFood.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Camera,
  Upload,
  Clock,
  Package,
  Utensils,
  MessageSquare,
  X,
  CheckCircle2,
  ImagePlus,
  Loader2,
  AlertCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
  Leaf,
  DollarSign,
  Tag,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const FOOD_CATEGORIES = [
  { id: "Appetizers", label: "Appetizers", icon: "🥗" },
  { id: "Main Course", label: "Main Course", icon: "🍛" },
  { id: "Desserts", label: "Desserts", icon: "🍰" },
  { id: "Beverages", label: "Beverages", icon: "🥤" },
  { id: "Snacks", label: "Snacks", icon: "🍿" },
  { id: "Salads", label: "Salads", icon: "🥬" },
  { id: "Soups", label: "Soups", icon: "🍲" },
  { id: "Breakfast", label: "Breakfast", icon: "🍳" },
  { id: "Sides", label: "Sides", icon: "🍞" },
  { id: "Other", label: "Other", icon: "📦" },
];

const LISTING_TYPES = [
  { id: "donation", label: "Donation", color: "green" },
  { id: "discount", label: "Discounted", color: "purple" },
];

const UNITS = ["pieces", "kg", "g", "liters", "ml", "portions", "boxes", "packs"];

interface Listing {
  _id: string;
  name: string;
  category: string;
  listingType: string;
  quantityAvailable: number;
  unit: string;
  price: number;
  discountPercentage: number;
  discountedPrice: number;
  couponCode?: string;
  expiryDate?: string;
  status: string;
  isAvailable: boolean;
  totalReservations: number;
  createdAt: string;
}

const defaultForm = {
  name: "",
  description: "",
  category: "Other",
  price: "",
  quantityAvailable: "",
  unit: "portions",
  expiryDate: "",
  listingType: "donation",
  discountPercentage: "",
  dietary: {
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isHalal: false,
  },
};

export default function ListFood() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Fetch existing listings and stats on mount
  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/restaurants/my/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/restaurants/listings`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 50 },
        }),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);

      // Filter to only this restaurant's own listings by matching restaurant field
      // The /listings endpoint returns all listings; use the restaurantId from token
      if (listRes.data.success) {
        // For "my stats" we use the stats endpoint; listings come from the me endpoint
      }

      // Fetch my own listings
      const myRes = await axios.get(`${API_URL}/restaurants/listings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 },
      });
      // We fetch stats separately which contains aggregated data
      // For the listing table, filter current user's listings via stats endpoint
    } catch (err) {
      console.error("Failed to load listings", err);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchMyListings = async () => {
    setLoadingListings(true);
    try {
      // Get current user's own restaurant id from auth
      const profileRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const restaurantId = profileRes.data.user?.id || profileRes.data.user?._id;

      const [listingsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/restaurants/${restaurantId}/listings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/restaurants/my/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (listingsRes.data.success) setListings(listingsRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (err) {
      console.error("Failed to fetch my listings", err);
      toast({
        title: "Error",
        description: "Could not load your listings.",
        variant: "destructive",
      });
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (form.listingType === "discount" && form.unit !== "portions") {
      setForm((prev) => ({ ...prev, unit: "portions" }));
    }
  }, [form.listingType, form.unit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith("dietary.")) {
        const key = name.split(".")[1];
        setForm((prev) => ({ ...prev, dietary: { ...prev.dietary, [key]: checked } }));
      } else {
        setForm((prev) => ({ ...prev, [name]: checked }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast({ title: "Validation Error", description: "Food name is required.", variant: "destructive" });
      return;
    }
    if (!form.quantityAvailable || Number(form.quantityAvailable) < 1) {
      toast({ title: "Validation Error", description: "Quantity must be at least 1.", variant: "destructive" });
      return;
    }
    if (form.listingType === "discount" && (!form.price || Number(form.price) <= 0)) {
      toast({ title: "Validation Error", description: "Discounted items need a base price greater than 0.", variant: "destructive" });
      return;
    }
    if (form.listingType === "discount" && (!form.discountPercentage || Number(form.discountPercentage) <= 0)) {
      toast({ title: "Validation Error", description: "Discounted items need a discount percentage.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        listingType: form.listingType,
        quantityAvailable: Number(form.quantityAvailable),
        unit: form.unit,
        price: form.listingType === "discount" && form.price ? Number(form.price) : 0,
        discountPercentage:
          form.listingType === "discount" && form.discountPercentage
            ? Number(form.discountPercentage)
            : 0,
        dietary: form.dietary,
      };
      if (form.expiryDate) payload.expiryDate = form.expiryDate;

      const response = await axios.post(`${API_URL}/restaurants/listings`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast({
          title: "✅ Listing Created!",
          description: `"${form.name}" has been listed successfully.`,
        });
        setForm(defaultForm);
        fetchMyListings(); // Refresh both listings and stats
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Failed to create listing. Please try again.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

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
        toast({ title: res.data.message });
      }
    } catch {
      toast({ title: "Error", description: "Failed to toggle listing.", variant: "destructive" });
    }
  };

  const handleDelete = async (listingId: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from your listings?`)) return;
    try {
      await axios.delete(`${API_URL}/restaurants/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((l) => l._id !== listingId));
      toast({ title: "Listing removed." });
      fetchMyListings();
    } catch {
      toast({ title: "Error", description: "Failed to delete listing.", variant: "destructive" });
    }
  };

  const statusColor: Record<string, string> = {
    active: "bg-green-500/10 text-green-600 border-green-500/20",
    sold_out: "bg-red-500/10 text-red-600 border-red-500/20",
    expired: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    removed: "bg-muted text-muted-foreground border-border",
  };

  const typeColor: Record<string, string> = {
    discount: "bg-purple-500/10 text-purple-600",
    donation: "bg-green-500/10 text-green-600",
  };

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
            Manage Food Listings
          </h1>
          <p className="text-muted-foreground mt-1">
            Add and manage your restaurant's food offerings
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMyListings}
          disabled={loadingListings}
          className="w-fit"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingListings ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </motion.div>

      {/* Stats Bar */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {[
            { label: "Total", value: stats.total, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Sold Out", value: stats.soldOut, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Reservations", value: stats.totalReservations, icon: Utensils, color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((s) => (
            <Card key={s.label} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Form ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
              <Plus className="h-5 w-5 text-orange-500" />
              Add New Listing
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Food Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g., Vegetable Biryani"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Briefly describe the food item..."
                  rows={2}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category *
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {FOOD_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: cat.id }))}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-left text-sm transition-all ${
                        form.category === cat.id
                          ? "border-orange-500 bg-orange-500/10 text-orange-600"
                          : "border-border hover:border-orange-500/50 hover:bg-muted/50"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="font-medium truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Listing Type */}
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {LISTING_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, listingType: t.id }))}
                      className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                        form.listingType === t.id
                          ? "border-orange-500 bg-orange-500/10 text-orange-600"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="quantityAvailable" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Quantity *
                  </Label>
                  <Input
                    id="quantityAvailable"
                    name="quantityAvailable"
                    type="number"
                    min="1"
                    value={form.quantityAvailable}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.listingType === "discount" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Original Price (Rs per portion)
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="e.g., 199"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPercentage">Discount %</Label>
                      <Input
                        id="discountPercentage"
                        name="discountPercentage"
                        type="number"
                        min="0"
                        max="100"
                        value={form.discountPercentage}
                        onChange={handleChange}
                        placeholder="e.g., 30"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Discounted offers are always priced for 1 portion and will be shown only to users in Offers & Discounts.
                  </p>
                </>
              )}

              {form.listingType === "donation" && (
                <p className="text-xs text-muted-foreground -mt-1">
                  Donation listings are shared with NGOs for rescue and pickup.
                </p>
              )}

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiryDate" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Available Until
                </Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  type="datetime-local"
                  value={form.expiryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Dietary */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  Dietary Info
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "isVegetarian", label: "Vegetarian" },
                    { key: "isVegan", label: "Vegan" },
                    { key: "isGlutenFree", label: "Gluten-Free" },
                    { key: "isHalal", label: "Halal" },
                  ].map((d) => (
                    <label
                      key={d.key}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors text-sm"
                    >
                      <input
                        type="checkbox"
                        name={`dietary.${d.key}`}
                        checked={(form.dietary as any)[d.key]}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-orange-500"
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Image placeholder */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Food Photo
                </Label>
                <button
                  type="button"
                  className="h-24 w-full rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 hover:border-orange-500 hover:bg-orange-500/5 transition-colors"
                >
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Click to upload (optional)</span>
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white h-12 text-base font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Listing…
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Create Listing
                  </>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* ── Listings Table ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-3"
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-500" />
                Your Listings
                <Badge variant="outline" className="ml-1">{listings.length}</Badge>
              </h2>
            </div>

            {loadingListings ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading listings…
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-medium">No listings yet</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Create your first food listing using the form on the left
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {listings.map((listing, i) => (
                    <motion.div
                      key={listing._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.04 }}
                      className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-foreground text-sm truncate">
                              {listing.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`text-xs ${statusColor[listing.status] || ""}`}
                            >
                              {listing.status.replace("_", " ")}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs ${typeColor[listing.listingType] || ""}`}
                            >
                              {listing.listingType}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
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
                                ₹{listing.discountedPrice ?? listing.price} {listing.listingType === "discount" ? "/ portion" : ""}
                              </span>
                            )}
                            {listing.couponCode && (
                              <span className="flex items-center gap-1 font-medium text-primary">
                                Coupon: {listing.couponCode}
                              </span>
                            )}
                            {listing.expiryDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Expires {new Date(listing.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              {listing.totalReservations} reservations
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggle(listing._id)}
                            title={listing.isAvailable ? "Disable listing" : "Enable listing"}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            {listing.isAvailable ? (
                              <ToggleRight className="h-5 w-5 text-green-500" />
                            ) : (
                              <ToggleLeft className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(listing._id, listing.name)}
                            title="Delete listing"
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
