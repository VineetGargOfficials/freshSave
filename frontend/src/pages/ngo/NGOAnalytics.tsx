// src/pages/ngo/NGOAnalytics.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Utensils,
  Users,
  Leaf,
  Clock,
  Calendar,
  Download,
  Filter,
  MapPin,
  Building2,
  Award,
  Target,
  FileSpreadsheet,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Truck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const monthlyData = [
  { month: "Aug", meals: 145, pickups: 12, volunteers: 18 },
  { month: "Sep", meals: 198, pickups: 16, volunteers: 20 },
  { month: "Oct", meals: 256, pickups: 21, volunteers: 22 },
  { month: "Nov", meals: 312, pickups: 25, volunteers: 23 },
  { month: "Dec", meals: 389, pickups: 31, volunteers: 24 },
  { month: "Jan", meals: 456, pickups: 38, volunteers: 24 },
];

const impactMetrics = [
  {
    title: "Meals Distributed",
    value: "1,756",
    change: "+17.2%",
    previousValue: "1,500",
    trend: "up",
    icon: Utensils,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Food Saved (kg)",
    value: "842",
    change: "+15.8%",
    previousValue: "727",
    trend: "up",
    icon: Leaf,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Active Volunteers",
    value: "24",
    change: "+4",
    previousValue: "20",
    trend: "up",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Avg Pickup Time",
    value: "28 min",
    change: "-12%",
    previousValue: "32 min",
    trend: "up",
    icon: Clock,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

const restaurantPartners = [
  { name: "Spice Garden Restaurant", pickups: 45, meals: 625, percentage: 28 },
  { name: "Baker's Delight", pickups: 38, meals: 498, percentage: 22 },
  { name: "Green Valley Kitchen", pickups: 32, meals: 412, percentage: 18 },
  { name: "Curry House", pickups: 28, meals: 356, percentage: 16 },
  { name: "Others", pickups: 42, meals: 365, percentage: 16 },
];

const volunteerPerformance = [
  { name: "Raj Kumar", pickups: 42, hours: 168, meals: 589 },
  { name: "Priya Sharma", pickups: 38, hours: 152, meals: 512 },
  { name: "Amit Singh", pickups: 35, hours: 140, meals: 478 },
  { name: "Neha Patel", pickups: 32, hours: 128, meals: 445 },
  { name: "Vikram Reddy", pickups: 28, hours: 112, meals: 398 },
];

const environmentalImpact = {
  co2Saved: 1263,
  treesEquivalent: 63,
  waterSaved: 84200,
  landfillDiverted: 842,
  mealsServed: 1756,
};

const availableReports = [
  {
    name: "Monthly Impact Report",
    description: "Detailed breakdown of meals served and food saved",
    icon: "📊",
    type: "PDF",
    size: "3.2 MB",
    date: "Jan 2025",
  },
  {
    name: "Donor Contribution Report",
    description: "Track contributions from each restaurant partner",
    icon: "🏪",
    type: "Excel",
    size: "1.8 MB",
    date: "Jan 2025",
  },
  {
    name: "Volunteer Activity Report",
    description: "Hours logged and pickups completed by volunteers",
    icon: "👥",
    type: "PDF",
    size: "2.4 MB",
    date: "Jan 2025",
  },
  {
    name: "Environmental Impact Report",
    description: "CO2 emissions prevented and waste diverted",
    icon: "🌍",
    type: "PDF",
    size: "2.8 MB",
    date: "Jan 2025",
  },
  {
    name: "Complete Pickup History",
    description: "All pickups with timestamps and locations",
    icon: "📋",
    type: "Excel",
    size: "2.1 MB",
    date: "Jan 2025",
  },
  {
    name: "Annual Summary Report",
    description: "Year-end summary and achievements",
    icon: "🏆",
    type: "PDF",
    size: "4.5 MB",
    date: "2024",
  },
];

const timeFilters = ["This Week", "This Month", "Last 3 Months", "This Year", "All Time"];

const peakHours = [
  { hour: "6 PM", pickups: 12 },
  { hour: "7 PM", pickups: 18 },
  { hour: "8 PM", pickups: 15 },
  { hour: "9 PM", pickups: 8 },
];

export default function NGOAnalytics() {
  const { user } = useAuth();
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("This Month");
  const maxMeals = Math.max(...monthlyData.map(d => d.meals));
  const maxPickups = Math.max(...peakHours.map(h => h.pickups));

  const handleExportPDF = () => {
    alert("Exporting Analytics Report as PDF...");
  };

  const handleExportExcel = () => {
    alert("Exporting Analytics Data as Excel...");
  };

  const handleDownloadReport = (reportName: string, type: string) => {
    alert(`Downloading ${reportName} (${type})...`);
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
            <BarChart3 className="h-8 w-8 text-blue-500" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your impact and download detailed reports
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
            Export Excel
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </motion.div>

      {/* Time Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {timeFilters.map((filter) => (
          <Button
            key={filter}
            variant={selectedTimeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeFilter(filter)}
            className={selectedTimeFilter === filter ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            {filter}
          </Button>
        ))}
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
            <Card className="glass-card p-4">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    metric.trend === "up"
                      ? "text-green-600 border-green-500/30 bg-green-500/10"
                      : "text-red-600 border-red-500/30 bg-red-500/10"
                  }`}
                >
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}
                </Badge>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  vs {metric.previousValue} last month
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Meals Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Meals Distribution Trend</h2>
                <p className="text-sm text-muted-foreground">Monthly meals collected over 6 months</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                +214% growth
              </Badge>
            </div>

            {/* Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-3">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {data.meals} meals<br/>
                      {data.pickups} pickups
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.meals / maxMeals) * 180}px` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg cursor-pointer hover:from-blue-600 hover:to-blue-500 transition-colors"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-xs text-muted-foreground">Meals</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Total: <span className="font-semibold text-foreground">1,756 meals</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Environmental Impact */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-6 bg-gradient-to-br from-green-500/5 to-emerald-500/5 border-green-500/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  Environmental Impact
                </h2>
                <p className="text-sm text-muted-foreground">Your contribution to the planet</p>
              </div>
              <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                Eco Champion
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "CO2 Saved", value: `${environmentalImpact.co2Saved} kg`, icon: "🌿", color: "text-green-500" },
                { label: "Trees Equivalent", value: environmentalImpact.treesEquivalent, icon: "🌳", color: "text-emerald-500" },
                { label: "Water Saved", value: `${(environmentalImpact.waterSaved / 1000).toFixed(1)}K L`, icon: "💧", color: "text-blue-500" },
                { label: "Landfill Diverted", value: `${environmentalImpact.landfillDiverted} kg`, icon: "♻️", color: "text-orange-500" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4 rounded-xl bg-background/50 text-center"
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-400 text-center">
                🎉 You've saved equivalent of <strong>63 trees</strong> worth of CO2 this year!
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Restaurant Partners & Peak Hours */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Restaurant Partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-500" />
                  Restaurant Partner Analytics
                </h2>
                <p className="text-sm text-muted-foreground">Food collection by partner</p>
              </div>
            </div>

            <div className="space-y-4">
              {restaurantPartners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-lg">
                        {index === 0 ? "🍛" : index === 1 ? "🍞" : index === 2 ? "🥗" : index === 3 ? "🍛" : "🏪"}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{partner.name}</p>
                        <p className="text-xs text-muted-foreground">{partner.pickups} pickups • {partner.meals} meals</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{partner.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${partner.percentage}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Peak Pickup Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Peak Pickup Hours
                </h2>
                <p className="text-sm text-muted-foreground">Optimal times for food collection</p>
              </div>
            </div>

            <div className="space-y-3">
              {peakHours.map((data, index) => (
                <div key={data.hour} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-12">{data.hour}</span>
                  <div className="flex-1 h-10 bg-muted/30 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.pickups / maxPickups) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-lg flex items-center justify-end pr-2"
                    >
                      <span className="text-xs text-white font-medium">{data.pickups} pickups</span>
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Peak Hour:</span> 7 PM (18 pickups)
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Volunteers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performing Volunteers
            </h2>
            <Button variant="outline" size="sm">
              View All Volunteers
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {volunteerPerformance.map((volunteer, index) => (
              <motion.div
                key={volunteer.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + index * 0.05 }}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-center"
              >
                <div className={`h-12 w-12 rounded-full mx-auto mb-2 flex items-center justify-center text-xl ${
                  index === 0 ? "bg-yellow-500/20" : "bg-blue-500/10"
                }`}>
                  {index === 0 ? "🏆" : "👤"}
                </div>
                <p className="font-medium text-foreground text-sm truncate">{volunteer.name}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">{volunteer.pickups} pickups</p>
                  <p className="text-xs text-muted-foreground">{volunteer.hours} hours</p>
                  <p className="text-sm font-semibold text-green-600">{volunteer.meals} meals</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Downloadable Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              Downloadable Reports
            </h2>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableReports.map((report, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
                className="flex gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
                onClick={() => handleDownloadReport(report.name, report.type)}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                  {report.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground text-sm truncate">{report.name}</h3>
                    <Badge variant="outline" className={`text-xs shrink-0 ${
                      report.type === "PDF" 
                        ? "text-red-600 border-red-500/30" 
                        : "text-green-600 border-green-500/30"
                    }`}>
                      {report.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{report.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{report.size}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Need a custom report?</h3>
              <p className="text-sm text-muted-foreground">
                Export your analytics data in your preferred format with custom date ranges
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Custom Range
              </Button>
              <Button variant="outline" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Excel (.xlsx)
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2 text-red-600" />
                PDF Report
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}