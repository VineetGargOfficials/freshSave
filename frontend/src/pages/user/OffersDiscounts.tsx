import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgePercent,
  Copy,
  Loader2,
  MapPin,
  Search,
  Store,
  Tag,
  TicketPercent,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface OfferListing {
  _id: string;
  name: string;
  description?: string;
  category: string;
  listingType: string;
  price: number;
  discountPercentage: number;
  discountedPrice?: number;
  couponCode?: string;
  quantityAvailable: number;
  unit: string;
  restaurant?: {
    name?: string;
    organizationName?: string;
    address?: {
      city?: string;
      state?: string;
      fullAddress?: string;
    };
  };
}

const categories = ["all", "Appetizers", "Main Course", "Desserts", "Beverages", "Snacks", "Salads", "Soups", "Breakfast", "Sides", "Other"];

export default function OffersDiscounts() {
  const { token, user } = useAuth();
  const [offers, setOffers] = useState<OfferListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cityFilter, setCityFilter] = useState(user?.address?.city || "");
  const [minDiscount, setMinDiscount] = useState("0");
  const [nearbyOnly, setNearbyOnly] = useState(Boolean(user?.address?.city));

  useEffect(() => {
    setCityFilter(user?.address?.city || "");
    setNearbyOnly(Boolean(user?.address?.city));
  }, [user?.address?.city]);

  useEffect(() => {
    fetchOffers();
  }, [token]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/restaurants/listings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          listingType: "discount",
          limit: 100,
        },
      });

      if (response.data?.success) {
        setOffers(response.data.data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch offers", error);
      toast.error(error.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = useMemo(() => {
    const minDiscountValue = Number(minDiscount) || 0;

    return offers.filter((offer) => {
      const restaurantName = offer.restaurant?.organizationName || offer.restaurant?.name || "";
      const city = offer.restaurant?.address?.city || "";

      const matchesQuery =
        !query ||
        offer.name.toLowerCase().includes(query.toLowerCase()) ||
        (offer.description || "").toLowerCase().includes(query.toLowerCase()) ||
        restaurantName.toLowerCase().includes(query.toLowerCase());

      const matchesCategory = category === "all" || offer.category === category;
      const matchesDiscount = (offer.discountPercentage || 0) >= minDiscountValue;
      const matchesCity = !cityFilter || city.toLowerCase().includes(cityFilter.toLowerCase());
      const matchesNearby = !nearbyOnly || !user?.address?.city || city.toLowerCase() === user.address.city.toLowerCase();

      return matchesQuery && matchesCategory && matchesDiscount && matchesCity && matchesNearby;
    });
  }, [offers, query, category, minDiscount, cityFilter, nearbyOnly, user?.address?.city]);

  const copyCoupon = async (couponCode?: string) => {
    if (!couponCode) {
      toast.error("Coupon code is not available for this offer");
      return;
    }

    try {
      await navigator.clipboard.writeText(couponCode);
      toast.success(`Coupon copied: ${couponCode}`);
    } catch {
      toast.error("Failed to copy coupon");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <TicketPercent className="h-8 w-8 text-primary" />
              Offers & Discounts
            </h1>
            <p className="text-muted-foreground mt-1">
              Find discounted food offers from nearby restaurants in rupees, per portion, and copy coupon codes instantly.
            </p>
          </div>
          <Button variant="outline" onClick={fetchOffers} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BadgePercent className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </motion.div>

      <Card className="glass-card p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search food, restaurant, or offer"
              className="pl-10"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All categories" : item}
              </option>
            ))}
          </select>
          <Input
            value={minDiscount}
            onChange={(e) => setMinDiscount(e.target.value)}
            type="number"
            min="0"
            max="100"
            placeholder="Min % off"
          />
          <Input
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="Filter by city"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={nearbyOnly}
              onChange={(e) => setNearbyOnly(e.target.checked)}
            />
            Nearby to my location
          </label>
        </div>
      </Card>

      {loading ? (
        <div className="py-16 flex items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-3" />
          Loading offers...
        </div>
      ) : filteredOffers.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <TicketPercent className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No offers found</h3>
          <p className="text-sm text-muted-foreground">
            Try widening your location or lowering the discount filter.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {filteredOffers.map((offer, index) => {
              const restaurantName = offer.restaurant?.organizationName || offer.restaurant?.name || "Restaurant";
              const restaurantAddress = offer.restaurant?.address?.fullAddress
                || [offer.restaurant?.address?.city, offer.restaurant?.address?.state].filter(Boolean).join(", ");

              return (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="glass-card p-5 h-full flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{offer.name}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <Store className="h-4 w-4" />
                          {restaurantName}
                        </p>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                        {offer.discountPercentage}% OFF
                      </Badge>
                    </div>

                    {offer.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{offer.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {offer.category}
                      </Badge>
                      <Badge variant="outline">
                        {offer.quantityAvailable} {offer.unit}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-muted/30 border border-border/50 mb-4">
                      <p className="text-xs text-muted-foreground">Price per portion</p>
                      <div className="flex items-end gap-2 mt-1">
                        <span className="text-sm line-through text-muted-foreground">₹{offer.price}</span>
                        <span className="text-2xl font-bold text-primary">
                          ₹{offer.discountedPrice ?? offer.price}
                        </span>
                      </div>
                    </div>

                    {restaurantAddress && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2 mb-4">
                        <MapPin className="h-3.5 w-3.5" />
                        {restaurantAddress}
                      </p>
                    )}

                    <div className="mt-auto p-3 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground mb-2">Coupon code</p>
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-sm font-semibold text-primary">{offer.couponCode || "Generating..."}</code>
                        <Button size="sm" onClick={() => copyCoupon(offer.couponCode)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Avail Offer
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
