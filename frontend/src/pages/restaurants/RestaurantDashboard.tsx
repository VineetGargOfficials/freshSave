// src/pages/restaurants/RestaurantHome.tsx
import { motion } from "framer-motion";
import {
  TrendingUp,
  Utensils,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  Calendar,
  Bell,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const mockStats = [
  { label: "Food Listed", value: "0", icon: Utensils, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  { label: "NGOs Connected", value: "0", icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { label: "Meals Donated", value: "0", icon: TrendingUp, color: "text-green-500", bgColor: "bg-green-500/10" },
  { label: "Pending Pickups", value: "0", icon: Clock, color: "text-purple-500", bgColor: "bg-purple-500/10" },
];

const upcomingFeatures = [
  {
    icon: "📸",
    title: "Quick Food Listing",
    description: "List surplus food in seconds with photo upload.",
    status: "In Development",
  },
  {
    icon: "🤝",
    title: "NGO Matching",
    description: "Connect with verified NGOs in your area.",
    status: "In Development",
  },
  {
    icon: "🚚",
    title: "Pickup Management",
    description: "Schedule and track food pickups.",
    status: "Planned",
  },
  {
    icon: "📊",
    title: "Waste Analytics",
    description: "Understand your food waste patterns.",
    status: "Planned",
  },
];

export default function RestaurantHome() {
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
              <span className="text-primary  font-medium">{user.organizationName}</span>
            )}
            {user?.organizationName && " · "}
            Manage your surplus food donations
          </p>
        </div>
      </motion.div>

      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="glass-card p-4 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl gradient-primary  flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Have surplus food?</h3>
                <p className="text-sm text-muted-foreground">List it now and help reduce waste</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate("/restaurant/list-food")}
              className="bg-gradient-to-r gradient-primary  text-white"
            >
              List Food
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card p-4 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active Listings Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Utensils className="h-5 w-5 text-orange-500" />
                Active Listings
              </h2>
              <Badge variant="secondary">Preview</Badge>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                <Utensils className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                No Active Listings
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                When you list surplus food, it will appear here for NGOs to claim.
              </p>
              <Badge className="bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 border-orange-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Feature Coming Soon
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Pickup Requests Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-500" />
                Pickup Requests
              </h2>
              <Badge variant="secondary">Preview</Badge>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-blue-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                No Pickup Requests
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                NGOs will request pickups here when you list surplus food.
              </p>
              <Badge className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 border-blue-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Feature Coming Soon
              </Badge>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Features Coming Soon
            </h2>
            <Badge variant="outline" className="text-green-600 border-green-500/30">
              Q2 2025
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {upcomingFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-2xl">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {feature.description}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-2 text-xs ${
                      feature.status === "In Development"
                        ? "text-green-600 border-green-500/30 bg-green-500/10"
                        : "text-blue-600 border-blue-500/30 bg-blue-500/10"
                    }`}
                  >
                    {feature.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}