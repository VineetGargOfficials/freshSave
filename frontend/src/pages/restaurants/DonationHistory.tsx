// src/pages/restaurants/DonationHistory.tsx
import { useState } from "react";
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

const donationHistory = [
  {
    id: 1,
    food: "Dal Makhani with Rice",
    quantity: "30 portions",
    ngo: "Hope Foundation",
    ngoImage: "🏠",
    date: "2025-01-15",
    time: "7:30 PM",
    status: "completed",
    category: "Cooked Food",
    weight: "15 kg",
    pickupDuration: "25 mins",
  },
  {
    id: 2,
    food: "Fresh Bread Loaves",
    quantity: "40 pieces",
    ngo: "Community Kitchen",
    ngoImage: "🍳",
    date: "2025-01-15",
    time: "2:00 PM",
    status: "completed",
    category: "Bakery",
    weight: "8 kg",
    pickupDuration: "15 mins",
  },
  {
    id: 3,
    food: "Vegetable Biryani",
    quantity: "50 portions",
    ngo: "Care Center",
    ngoImage: "💚",
    date: "2025-01-14",
    time: "8:00 PM",
    status: "completed",
    category: "Cooked Food",
    weight: "25 kg",
    pickupDuration: "30 mins",
  },
  {
    id: 4,
    food: "Mixed Fruit Salad",
    quantity: "10 kg",
    ngo: "Children's Home",
    ngoImage: "👶",
    date: "2025-01-14",
    time: "4:30 PM",
    status: "completed",
    category: "Fruits",
    weight: "10 kg",
    pickupDuration: "20 mins",
  },
  {
    id: 5,
    food: "Paneer Curry & Roti",
    quantity: "25 portions",
    ngo: "Helping Hands",
    ngoImage: "🤝",
    date: "2025-01-13",
    time: "9:00 PM",
    status: "completed",
    category: "Cooked Food",
    weight: "12 kg",
    pickupDuration: "35 mins",
  },
  {
    id: 6,
    food: "Assorted Pastries",
    quantity: "24 pieces",
    ngo: "Hope Foundation",
    ngoImage: "🏠",
    date: "2025-01-13",
    time: "6:00 PM",
    status: "expired",
    category: "Bakery",
    weight: "5 kg",
    pickupDuration: "-",
  },
  {
    id: 7,
    food: "Curd Rice",
    quantity: "35 portions",
    ngo: "Community Kitchen",
    ngoImage: "🍳",
    date: "2025-01-12",
    time: "1:00 PM",
    status: "completed",
    category: "Cooked Food",
    weight: "18 kg",
    pickupDuration: "22 mins",
  },
  {
    id: 8,
    food: "Fresh Vegetables",
    quantity: "20 kg",
    ngo: "Care Center",
    ngoImage: "💚",
    date: "2025-01-12",
    time: "11:00 AM",
    status: "completed",
    category: "Raw Vegetables",
    weight: "20 kg",
    pickupDuration: "40 mins",
  },
  {
    id: 9,
    food: "Idli & Sambar",
    quantity: "60 portions",
    ngo: "Shelter Home",
    ngoImage: "🏘️",
    date: "2025-01-11",
    time: "8:30 AM",
    status: "completed",
    category: "Cooked Food",
    weight: "20 kg",
    pickupDuration: "18 mins",
  },
  {
    id: 10,
    food: "Sandwich Platter",
    quantity: "30 pieces",
    ngo: "Children's Home",
    ngoImage: "👶",
    date: "2025-01-10",
    time: "3:00 PM",
    status: "completed",
    category: "Bakery",
    weight: "6 kg",
    pickupDuration: "28 mins",
  },
];

const monthlyStats = [
  { month: "Jan", donations: 24, meals: 892 },
  { month: "Dec", donations: 18, meals: 654 },
  { month: "Nov", donations: 21, meals: 780 },
  { month: "Oct", donations: 15, meals: 520 },
];

const filterOptions = ["All", "Completed", "Pending", "Expired"];
const categoryFilters = ["All Categories", "Cooked Food", "Bakery", "Fruits", "Raw Vegetables", "Dairy"];

export default function DonationHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const filteredDonations = donationHistory.filter((donation) => {
    const matchesSearch = donation.food.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.ngo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || donation.status === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === "All Categories" || donation.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    totalDonations: 24,
    mealsServed: 892,
    ngosHelped: 8,
    foodSaved: "156 kg",
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
            <History className="h-8 w-8 text-orange-500" />
            Donation History
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all your past donations and impact
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
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
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categoryFilters.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Monthly Overview */}
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
          <div className="grid grid-cols-4 gap-3">
            {monthlyStats.map((stat, index) => (
              <div
                key={stat.month}
                className={`p-3 rounded-lg text-center ${
                  index === 0 ? "bg-orange-500/10 border border-orange-500/30" : "bg-muted/30"
                }`}
              >
                <p className="text-sm font-medium text-foreground">{stat.month}</p>
                <p className={`text-lg font-bold ${index === 0 ? "text-orange-500" : "text-foreground"}`}>
                  {stat.donations}
                </p>
                <p className="text-xs text-muted-foreground">{stat.meals} meals</p>
              </div>
            ))}
          </div>
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
              All Donations
            </h2>
            <Badge variant="outline">
              {filteredDonations.length} records
            </Badge>
          </div>

          <div className="space-y-3">
            {filteredDonations.map((donation, index) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-2xl shrink-0">
                  {donation.ngoImage}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{donation.food}</p>
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                      {donation.category}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {donation.quantity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {donation.ngo}
                    </span>
                    {donation.status === "completed" && (
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {donation.pickupDuration}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Badge
                    variant="outline"
                    className={
                      donation.status === "completed"
                        ? "text-green-600 border-green-500/30 bg-green-500/10"
                        : donation.status === "pending"
                        ? "text-yellow-600 border-yellow-500/30 bg-yellow-500/10"
                        : "text-red-600 border-red-500/30 bg-red-500/10"
                    }
                  >
                    {donation.status === "completed" ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : donation.status === "pending" ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : (
                      <XCircle className="h-3 w-3 mr-1" />
                    )}
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {donation.date} • {donation.time}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 hidden sm:flex">
                  <Eye className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Showing {filteredDonations.length} of {donationHistory.length} donations
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
            {[
              { name: "Hope Foundation", donations: 8, meals: 280, icon: "🏠" },
              { name: "Community Kitchen", donations: 6, meals: 245, icon: "🍳" },
              { name: "Care Center", donations: 5, meals: 198, icon: "💚" },
              { name: "Children's Home", donations: 5, meals: 169, icon: "👶" },
            ].map((ngo, index) => (
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
                  <span className="text-green-600 font-medium">{ngo.meals} meals</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}