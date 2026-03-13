// src/pages/restaurants/RestaurantDashboard.tsx
import { motion } from "framer-motion";
import {
  TrendingUp,
  Utensils,
  Users,
  Clock,
  ArrowRight,
  Calendar,
  Bell,
  Plus,
  MapPin,
  Package,
  CheckCircle2,
  ArrowUpRight,
  Leaf,
  Award,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  { label: "Food Listed", value: "24", change: "+8", icon: Utensils, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { label: "NGOs Connected", value: "8", change: "+2", icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { label: "Meals Donated", value: "892", change: "+156", icon: TrendingUp, color: "text-green-500", bgColor: "bg-green-500/10" },
  { label: "Pending Pickups", value: "3", change: "Today", icon: Clock, color: "text-purple-500", bgColor: "bg-purple-500/10" },
];

const activeListings = [
  {
    id: 1,
    name: "Dal Makhani with Rice",
    quantity: "30 portions",
    expiryTime: "5 hours",
    status: "available",
    claims: 2,
    posted: "30 mins ago",
  },
  {
    id: 2,
    name: "Fresh Bread Loaves",
    quantity: "40 pieces",
    expiryTime: "8 hours",
    status: "available",
    claims: 3,
    posted: "1 hour ago",
  },
  {
    id: 3,
    name: "Vegetable Biryani",
    quantity: "25 portions",
    expiryTime: "3 hours",
    status: "claimed",
    claims: 1,
    posted: "2 hours ago",
  },
];

const pickupRequests = [
  {
    id: 1,
    ngoName: "Hope Foundation",
    ngoImage: "🏠",
    foodItem: "Dal Makhani with Rice",
    pickupTime: "Today, 6:00 PM",
    status: "pending",
    distance: "2.5 km",
    requestedAt: "15 mins ago",
  },
  {
    id: 2,
    ngoName: "Community Kitchen",
    ngoImage: "🍳",
    foodItem: "Fresh Bread Loaves",
    pickupTime: "Today, 7:30 PM",
    status: "confirmed",
    distance: "1.8 km",
    requestedAt: "45 mins ago",
  },
  {
    id: 3,
    ngoName: "Care Center",
    ngoImage: "💚",
    foodItem: "Vegetable Biryani",
    pickupTime: "Tomorrow, 9:00 AM",
    status: "pending",
    distance: "3.2 km",
    requestedAt: "1 hour ago",
  },
];

const recentActivity = [
  {
    id: 1,
    action: "Food Picked Up",
    ngo: "Hope Foundation",
    food: "Mixed Fruit Salad",
    time: "2 hours ago",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  },
  {
    id: 2,
    action: "New Request",
    ngo: "Care Center",
    food: "Vegetable Biryani",
    time: "1 hour ago",
    icon: <Bell className="h-4 w-4 text-blue-500" />,
  },
  {
    id: 3,
    action: "Food Listed",
    ngo: "Available to all",
    food: "Dal Makhani with Rice",
    time: "30 mins ago",
    icon: <Plus className="h-4 w-4 text-orange-500" />,
  },
];

const quickInsights = [
  {
    title: "This Week's Impact",
    value: "156 meals",
    subtitle: "Served to 3 NGOs",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Environmental Savings",
    value: "23 kg CO2",
    subtitle: "Diverted from landfill",
    icon: <Leaf className="h-5 w-5" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Monthly Goal",
    value: "28/30",
    subtitle: "93% complete",
    icon: <Target className="h-5 w-5" />,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
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
            Manage your surplus food donations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
            <Award className="h-3 w-3 mr-1" />
            Level 4 Donor
          </Badge>
        </div>
      </motion.div>

      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="glass-card p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Have surplus food?</h3>
                <p className="text-sm text-muted-foreground">List it now and help reduce waste • 8 NGOs ready to pickup</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/restaurant/list-food")}
              className="bg-gradient-to-r gradient-primary text-white w-full sm:w-auto"
            >
              List Food
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="grid sm:grid-cols-3 gap-4">
        {quickInsights.map((insight, index) => (
          <motion.div
            key={insight.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
          >
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                  <div className={insight.color}>{insight.icon}</div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{insight.title}</p>
                  <p className="text-lg font-bold text-foreground">{insight.value}</p>
                  <p className="text-xs text-muted-foreground">{insight.subtitle}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Listings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-500" />
                Active Listings
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/restaurant/list-food")}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {activeListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{listing.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {listing.quantity}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {listing.expiryTime} left
                        </span>
                        <span>• {listing.posted}</span>
                      </div>
                    </div>
                    <Badge
                      variant={listing.status === "available" ? "default" : "secondary"}
                      className={
                        listing.status === "available"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }
                    >
                      {listing.status === "available" ? "Available" : "Claimed"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      {listing.claims} NGO{listing.claims !== 1 ? "s" : ""} interested
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      View Details
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Recent Activity
              </h2>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.1 }}
                  className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.food}</p>
                    <p className="text-xs text-muted-foreground">{activity.ngo} • {activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4" size="sm">
              View All Activity
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* Pickup Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Pickup Requests
              <Badge variant="outline" className="ml-2">
                {pickupRequests.filter(r => r.status === "pending").length} Pending
              </Badge>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pickupRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-xl">
                      {request.ngoImage}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground text-sm">{request.ngoName}</h3>
                      <p className="text-xs text-muted-foreground">{request.requestedAt}</p>
                    </div>
                  </div>
                  <Badge
                    variant={request.status === "confirmed" ? "default" : "secondary"}
                    className={
                      request.status === "confirmed"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }
                  >
                    {request.status === "confirmed" ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {request.status === "confirmed" ? "Confirmed" : "Pending"}
                  </Badge>
                </div>
                <p className="text-sm text-foreground font-medium mb-2">{request.foodItem}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {request.pickupTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {request.distance}
                  </span>
                </div>
                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs bg-green-500 hover:bg-green-600">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                      Decline
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}