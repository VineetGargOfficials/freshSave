// src/pages/restaurants/RestaurantAnalytics.tsx
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Utensils,
  Leaf,
  DollarSign,
  Download,
  Filter,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const impactMetrics = [
  {
    title: "Food Donated",
    value: "0 kg",
    change: "+0%",
    trend: "up",
    icon: Utensils,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Meals Served",
    value: "0",
    change: "+0%",
    trend: "up",
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "CO2 Saved",
    value: "0 kg",
    change: "+0%",
    trend: "up",
    icon: Leaf,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Tax Benefits",
    value: "₹0",
    change: "+0%",
    trend: "neutral",
    icon: DollarSign,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
];

const mockChartData = [
  { month: "Jan", value: 0 },
  { month: "Feb", value: 0 },
  { month: "Mar", value: 0 },
  { month: "Apr", value: 0 },
  { month: "May", value: 0 },
  { month: "Jun", value: 0 },
];

export default function RestaurantAnalytics() {
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
            <BarChart3 className="h-8 w-8 text-orange-500" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your donation impact and generate reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {impactMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card p-4 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  {metric.change}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.title}</p>
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

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Donations Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Donation Trend
              </h2>
              <Badge variant="secondary">Monthly</Badge>
            </div>

            {/* Mock Chart */}
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {mockChartData.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-orange-500/20 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(data.value * 2, 20)}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Analytics Coming Soon</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Track your donation trends with beautiful charts.
              </p>
              <Badge className="mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Q2 2025
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Environmental Impact */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Environmental Impact
              </h2>
              <Badge variant="secondary">This Year</Badge>
            </div>

            {/* Mock Donut */}
            <div className="h-64 flex items-center justify-center">
              <div className="relative">
                <div className="h-40 w-40 rounded-full border-8 border-orange-500/20 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">0</p>
                    <p className="text-xs text-muted-foreground">kg CO2 Saved</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Leaf className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Impact Tracking</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                See your environmental impact visualized.
              </p>
              <Badge className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Q2 2025
              </Badge>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Reports Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-500" />
              Available Reports
            </h2>
            <Badge variant="outline" className="text-orange-600 border-orange-500/30">
              Coming Soon
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: "Monthly Donation Report", icon: "📊", desc: "Detailed breakdown of all donations" },
              { name: "Tax Benefit Certificate", icon: "📄", desc: "Documentation for tax exemptions" },
              { name: "Environmental Impact Report", icon: "🌍", desc: "CO2 saved and waste diverted" },
              { name: "NGO Partnership Report", icon: "🤝", desc: "Summary of NGO collaborations" },
            ].map((report, index) => (
              <div
                key={index}
                className="flex gap-4 p-4 rounded-xl bg-muted/30"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-2xl">
                  {report.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{report.name}</h3>
                  <p className="text-sm text-muted-foreground">{report.desc}</p>
                </div>
                <Button variant="ghost" size="icon" disabled>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}