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
  Sparkles,
  Calendar,
  Building2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for demonstration
const upcomingFeatures = [
  {
    icon: "🔔",
    title: "Real-time Donation Alerts",
    description: "Get instant notifications when nearby restaurants have surplus food available.",
    status: "In Development",
  },
  {
    icon: "🗺️",
    title: "Smart Route Planning",
    description: "Optimized pickup routes to collect food from multiple locations efficiently.",
    status: "Planned",
  },
  {
    icon: "📅",
    title: "Pickup Scheduling",
    description: "Schedule and manage food pickups with automated reminders.",
    status: "Planned",
  },
  {
    icon: "💬",
    title: "Donor Communication",
    description: "Direct chat with restaurants and caterers for seamless coordination.",
    status: "Planned",
  },
];

const mockStats = [
  { label: "Meals Saved", value: "0", icon: Utensils, color: "text-green-500", bgColor: "bg-green-500/10" },
  { label: "Partner Restaurants", value: "0", icon: Building2, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { label: "Volunteers", value: "0", icon: Users, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { label: "Active Pickups", value: "0", icon: Clock, color: "text-orange-500", bgColor: "bg-orange-500/10" },
];

export default function NGOHome() {
  const { user } = useAuth();

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
        {/* Available Donations Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Available Donations
              </h2>
              <Badge variant="secondary">Preview</Badge>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                No Donations Yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                When restaurants list surplus food, you'll see real-time alerts here.
              </p>
              <Badge className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Feature Coming Soon
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Scheduled Pickups Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Scheduled Pickups
              </h2>
              <Badge variant="secondary">Preview</Badge>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                <Calendar className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                No Pickups Scheduled
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Schedule food pickups from partner restaurants and track them here.
              </p>
              <Badge className="bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 border-orange-500/20">
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                  </div>
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card p-6 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Want early access to new features?
              </h3>
              <p className="text-sm text-muted-foreground">
                We're building the NGO portal with your feedback. Let us know what features matter most to you.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shrink-0">
              Share Feedback
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}