// src/pages/ngo/NGOHome.tsx
import { motion } from "framer-motion";
import {
  Bell,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Utensils,
  ArrowRight,
  Calendar,
  Building2,
  Package,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Phone,
  Award,
  Target,
  Leaf,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Meals Collected", value: "1,248", change: "+156", icon: Utensils, color: "text-green-500", bgColor: "bg-green-500/10" },
  { label: "Partner Restaurants", value: "18", change: "+3", icon: Building2, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { label: "Active Volunteers", value: "24", change: "+2", icon: Users, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { label: "Today's Pickups", value: "5", change: "Scheduled", icon: Clock, color: "text-orange-500", bgColor: "bg-orange-500/10" },
];

const availableDonations = [
  {
    id: 1,
    restaurant: "Spice Garden Restaurant",
    restaurantImage: "🍛",
    food: "Dal Makhani with Rice",
    quantity: "30 portions",
    distance: "2.5 km",
    expiresIn: "5 hours",
    postedAt: "30 mins ago",
    category: "Cooked Food",
    status: "available",
  },
  {
    id: 2,
    restaurant: "Baker's Delight",
    restaurantImage: "🍞",
    food: "Fresh Bread Loaves",
    quantity: "40 pieces",
    distance: "1.8 km",
    expiresIn: "8 hours",
    postedAt: "1 hour ago",
    category: "Bakery",
    status: "available",
  },
  {
    id: 3,
    restaurant: "Green Valley Kitchen",
    restaurantImage: "🥗",
    food: "Fresh Vegetable Mix",
    quantity: "15 kg",
    distance: "3.2 km",
    expiresIn: "4 hours",
    postedAt: "45 mins ago",
    category: "Raw Vegetables",
    status: "available",
  },
  {
    id: 4,
    restaurant: "Curry House",
    restaurantImage: "🍛",
    food: "Vegetable Biryani",
    quantity: "25 portions",
    distance: "4.1 km",
    expiresIn: "3 hours",
    postedAt: "2 hours ago",
    category: "Cooked Food",
    status: "claimed",
  },
];

const scheduledPickups = [
  {
    id: 1,
    restaurant: "Spice Garden Restaurant",
    restaurantImage: "🍛",
    food: "Dal Makhani with Rice",
    quantity: "30 portions",
    time: "Today, 6:00 PM",
    distance: "2.5 km",
    status: "confirmed",
    volunteer: "Raj Kumar",
    address: "123 MG Road, Koramangala",
  },
  {
    id: 2,
    restaurant: "Baker's Delight",
    restaurantImage: "🍞",
    food: "Fresh Bread Loaves",
    quantity: "40 pieces",
    time: "Today, 7:30 PM",
    distance: "1.8 km",
    status: "in_progress",
    volunteer: "Priya Sharma",
    address: "456 HSR Layout",
  },
  {
    id: 3,
    restaurant: "Green Valley Kitchen",
    restaurantImage: "🥗",
    food: "Fresh Vegetable Mix",
    quantity: "15 kg",
    time: "Tomorrow, 9:00 AM",
    distance: "3.2 km",
    status: "pending",
    volunteer: "Amit Singh",
    address: "789 Indiranagar",
  },
];

const recentActivity = [
  {
    id: 1,
    action: "Pickup Completed",
    restaurant: "Curry House",
    food: "Vegetable Biryani - 25 portions",
    time: "2 hours ago",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  },
  {
    id: 2,
    action: "New Donation Alert",
    restaurant: "Spice Garden Restaurant",
    food: "Dal Makhani with Rice - 30 portions",
    time: "30 mins ago",
    icon: <Bell className="h-4 w-4 text-blue-500" />,
  },
  {
    id: 3,
    action: "Volunteer Assigned",
    restaurant: "Baker's Delight",
    food: "Fresh Bread Loaves - Raj Kumar",
    time: "1 hour ago",
    icon: <Users className="h-4 w-4 text-purple-500" />,
  },
];

const quickInsights = [
  {
    title: "This Week's Impact",
    value: "348 meals",
    subtitle: "Served to 156 people",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "CO2 Saved",
    value: "52 kg",
    subtitle: "Environmental impact",
    icon: <Leaf className="h-5 w-5" />,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Monthly Goal",
    value: "348/400",
    subtitle: "87% complete",
    icon: <Target className="h-5 w-5" />,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export default function NGOHome() {
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
            Here's your NGO dashboard overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">
            <Award className="h-3 w-3 mr-1" />
            Verified NGO
          </Badge>
        </div>
      </motion.div>

      {/* New Donations Alert */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="glass-card p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center animate-pulse">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">3 New Donations Available!</h3>
                <p className="text-sm text-muted-foreground">Fresh food available for pickup nearby • Expires in 3-8 hours</p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-full sm:w-auto"
            >
              View Donations
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
        {/* Available Donations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Available Donations
                <Badge variant="outline" className="ml-2">
                  {availableDonations.filter(d => d.status === "available").length} Available
                </Badge>
              </h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {availableDonations.slice(0, 3).map((donation, index) => (
                <motion.div
                  key={donation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-2xl">
                        {donation.restaurantImage}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{donation.restaurant}</h3>
                        <p className="text-sm text-muted-foreground">{donation.food}</p>
                      </div>
                    </div>
                    <Badge
                      variant={donation.status === "available" ? "default" : "secondary"}
                      className={
                        donation.status === "available"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      }
                    >
                      {donation.status === "available" ? "Available" : "Claimed"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {donation.quantity}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {donation.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires in {donation.expiresIn}
                    </span>
                  </div>
                  {donation.status === "available" && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1 h-8 text-xs bg-blue-500 hover:bg-blue-600">
                        <Navigation className="h-3 w-3 mr-1" />
                        Claim & Navigate
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                    </div>
                  )}
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
                    <p className="text-xs text-muted-foreground">{activity.restaurant} • {activity.time}</p>
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

      {/* Scheduled Pickups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Today's Scheduled Pickups
              <Badge variant="outline" className="ml-2">
                {scheduledPickups.length} Pickups
              </Badge>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scheduledPickups.map((pickup, index) => (
              <motion.div
                key={pickup.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-xl">
                      {pickup.restaurantImage}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground text-sm">{pickup.restaurant}</h3>
                      <p className="text-xs text-muted-foreground">{pickup.time}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      pickup.status === "confirmed" ? "default" : 
                      pickup.status === "in_progress" ? "secondary" : "outline"
                    }
                    className={
                      pickup.status === "confirmed"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : pickup.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }
                  >
                    {pickup.status === "confirmed" ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : pickup.status === "in_progress" ? (
                      <Clock className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertCircle className="h-3 w-3 mr-1" />
                    )}
                    {pickup.status === "confirmed" ? "Confirmed" : 
                     pickup.status === "in_progress" ? "In Progress" : "Pending"}
                  </Badge>
                </div>
                <p className="text-sm text-foreground font-medium mb-2">{pickup.food}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {pickup.quantity}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {pickup.distance}
                  </span>
                </div>
                <div className="mb-3 p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Volunteer:</span> {pickup.volunteer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Address:</span> {pickup.address}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                    <Navigation className="h-3 w-3 mr-1" />
                    Navigate
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                Great Work This Month!
              </h3>
              <p className="text-sm text-muted-foreground">
                You've collected 348 meals and saved 52 kg of CO2. Keep up the amazing work! 🌟
              </p>
            </div>
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shrink-0">
              View Impact Report
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}