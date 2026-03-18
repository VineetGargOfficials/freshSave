// src/pages/restaurants/DonationHistory.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  History,
  Calendar,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Package,
  Users,
  TrendingUp,
  MapPin,
  ChevronDown,
  Eye,
  Utensils,
  Truck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface NGO {
  name: string;
  organizationName?: string;
  phoneNumber?: string;
  email?: string;
  profileImage?: string;
  _id?: string;
}

interface ClaimRecord {
  _id: string;
  ngo: NGO;
  listing: {
    name: string;
    unit: string;
    status: string;
    category?: string;
  };
  quantity: number;
  unit: string;
  status: string;
  fulfillmentMethod?: "pickup" | "delivery";
  claimedAt: string;
}

// ── Synced from ListFood.tsx ──────────────────────────────────────────────────
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

const ALL_CATEGORY_FILTER = "All Categories";
const categoryFilters = [ALL_CATEGORY_FILTER, ...FOOD_CATEGORIES.map((c) => c.id)];
const filterOptions = ["All", "Completed", "Pending", "Expired"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildMonthlyStats(claims: ClaimRecord[]) {
  const now = new Date();
  // Build last 4 calendar months including current
  const months: { month: string; year: number; monthIdx: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ month: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), monthIdx: d.getMonth() });
  }

  return months.map(({ month, year, monthIdx }) => {
    const monthClaims = claims.filter((c) => {
      const d = new Date(c.claimedAt);
      return d.getFullYear() === year && d.getMonth() === monthIdx;
    });
    const donations = monthClaims.length;
    const meals = monthClaims.reduce((acc, c) => acc + (c.quantity || 0), 0);
    return { month, donations, meals };
  });
}

function exportToExcel(claims: ClaimRecord[]) {
  const rows = claims.map((c) => ({
    "Food Item": c.listing?.name || "Unknown",
    Category: c.listing?.category || "Other",
    Quantity: c.quantity,
    Unit: c.unit || c.listing?.unit || "",
    "NGO Name": c.ngo.organizationName || c.ngo.name || "",
    "NGO Phone": c.ngo.phoneNumber || "",
    "NGO Email": c.ngo.email || "",
    "Fulfillment Method": c.fulfillmentMethod || "",
    Status: c.status,
    "Claimed Date": new Date(c.claimedAt).toLocaleDateString(),
    "Claimed Time": new Date(c.claimedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Column widths
  ws["!cols"] = [
    { wch: 28 }, // Food Item
    { wch: 16 }, // Category
    { wch: 10 }, // Quantity
    { wch: 10 }, // Unit
    { wch: 26 }, // NGO Name
    { wch: 16 }, // NGO Phone
    { wch: 26 }, // NGO Email
    { wch: 18 }, // Fulfillment
    { wch: 14 }, // Status
    { wch: 14 }, // Date
    { wch: 12 }, // Time
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Donation History");

  // Summary sheet
  const monthly = buildMonthlyStats(claims);
  const summaryRows = monthly.map((m) => ({
    Month: m.month,
    "Total Donations": m.donations,
    "Total Meals / Units": m.meals,
  }));
  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  ws2["!cols"] = [{ wch: 14 }, { wch: 18 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Monthly Summary");

  XLSX.writeFile(wb, `Donation_History_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function DonationHistory() {
  const { token } = useAuth();
  const [claims, setClaims] = useState<ClaimRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY_FILTER);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/restaurants/my/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setClaims(res.data.data);
      }
    } catch (err) {
      console.error("Fetch claims error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line
  }, []);

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      (claim.listing?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (claim.ngo.organizationName || claim.ngo.name || "").toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = statusFilter === "All";
    if (statusFilter === "Completed") {
      matchesStatus = ["completed", "distributed", "picked_up"].includes(claim.status);
    } else if (statusFilter === "Pending") {
      matchesStatus = claim.status === "claimed";
    } else if (statusFilter === "Expired") {
      matchesStatus = claim.status === "cancelled" || claim.status === "expired";
    }

    const matchesCategory =
      categoryFilter === ALL_CATEGORY_FILTER ||
      (claim.listing?.category || "Other") === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    totalDonations: claims.length,
    mealsServed: claims.reduce((acc, c) => acc + (c.quantity || 0), 0),
    ngosHelped: new Set(claims.map((c) => c.ngo._id || c.ngo.name)).size,
    foodSaved: `${claims.reduce((acc, c) => acc + (c.quantity || 0), 0)} Units`,
  };

  // Dynamic monthly stats
  const monthlyStats = buildMonthlyStats(claims);

  const topNGOs = Object.values(
    claims.reduce((acc, c) => {
      const id = c.ngo.organizationName || c.ngo.name;
      if (!acc[id]) {
        acc[id] = { name: id, donations: 0, meals: 0, icon: "🏢" };
      }
      acc[id].donations += 1;
      acc[id].meals += c.quantity;
      return acc;
    }, {} as Record<string, any>)
  )
    .sort((a, b) => b.donations - a.donations)
    .slice(0, 4);

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
            <History className="h-8 w-8 text-orange-500" />
            Donation History
          </h1>
          <p className="text-muted-foreground mt-1">Track all your past donations and impact</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportToExcel(claims)}
            disabled={claims.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Donations", value: stats.totalDonations, icon: Package, color: "text-orange-500", bgColor: "bg-orange-500/10" },
            { label: "Meals Served", value: stats.mealsServed, icon: Utensils, color: "text-green-500", bgColor: "bg-green-500/10" },
            { label: "NGOs Helped", value: stats.ngosHelped, icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
            { label: "Food Saved", value: stats.foodSaved, icon: TrendingUp, color: "text-purple-500", bgColor: "bg-purple-500/10" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
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
            placeholder="Search by food or NGO name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categoryFilters.map((option) => (
              <option key={option} value={option}>
                {option === ALL_CATEGORY_FILTER
                  ? ALL_CATEGORY_FILTER
                  : `${FOOD_CATEGORIES.find((c) => c.id === option)?.icon ?? ""} ${option}`}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Monthly Overview — dynamic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Monthly Overview
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {monthlyStats.map((stat, index) => (
                <div
                  key={stat.month}
                  className={`p-3 rounded-lg text-center ${
                    index === monthlyStats.length - 1
                      ? "bg-orange-500/10 border border-orange-500/30"
                      : "bg-muted/30"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{stat.month}</p>
                  <p
                    className={`text-lg font-bold ${
                      index === monthlyStats.length - 1 ? "text-orange-500" : "text-foreground"
                    }`}
                  >
                    {stat.donations}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.meals} units</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Donation List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              All Claims &amp; Donations
            </h2>
            <Badge variant="outline">{filteredClaims.length} records</Badge>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4" />
              <p>Fetching your donation history...</p>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border text-center">
              <Package className="h-12 w-12 opacity-20 mb-3" />
              <p className="font-medium">No donation records found</p>
              <p className="text-xs">Your future claims and donations will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClaims.map((claim, index) => {
                const categoryMeta = FOOD_CATEGORIES.find(
                  (c) => c.id === (claim.listing?.category || "Other")
                );
                return (
                  <motion.div
                    key={claim._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-2xl shrink-0">
                      {categoryMeta?.icon ?? "🏢"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">
                          {claim.listing?.name || "Unknown Item"}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-xs hidden sm:inline-flex capitalize"
                        >
                          {claim.listing?.status || claim.status}
                        </Badge>
                        {claim.listing?.category && (
                          <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                            {categoryMeta?.icon} {claim.listing.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {claim.quantity} {claim.unit || claim.listing?.unit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {claim.ngo.organizationName || claim.ngo.name}
                        </span>
                        {claim.ngo.phoneNumber && (
                          <span className="flex items-center gap-1 text-[11px]">
                            📱 {claim.ngo.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      {claim.fulfillmentMethod && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] uppercase font-bold border-none",
                            claim.fulfillmentMethod === "pickup"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-purple-500/10 text-purple-600"
                          )}
                        >
                          {claim.fulfillmentMethod === "pickup" ? "🏃 Pickup" : "🚚 Delivery"}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={
                          claim.status === "completed" || claim.status === "distributed"
                            ? "text-green-600 border-green-500/30 bg-green-500/10"
                            : claim.status === "claimed"
                            ? "text-yellow-600 border-yellow-500/30 bg-yellow-500/10"
                            : "text-red-600 border-red-500/30 bg-red-500/10"
                        }
                      >
                        {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(claim.claimedAt).toLocaleDateString()} •{" "}
                        {new Date(claim.claimedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Showing {filteredClaims.length} of {claims.length} records
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Top NGO Partners */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Top NGO Partners
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topNGOs.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                No NGO partners yet
              </p>
            ) : (
              topNGOs.map((ngo, index) => (
                <motion.div
                  key={ngo.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-xl">
                      {ngo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{ngo.name}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{ngo.donations} donations</span>
                    <span className="text-green-600 font-medium">{ngo.meals} units</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}