// src/pages/restaurants/RestaurantAnalytics.tsx
import { useState } from "react";
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
  Users,
  Package,
  FileSpreadsheet,
  FileText,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Target,
  Award,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const impactMetrics = [
  {
    title: "Food Donated",
    value: "156 kg",
    change: "+12.5%",
    trend: "up",
    icon: Utensils,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    previousValue: "138 kg",
  },
  {
    title: "Meals Served",
    value: "892",
    change: "+18.2%",
    trend: "up",
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    previousValue: "754",
  },
  {
    title: "CO2 Saved",
    value: "234 kg",
    change: "+15.8%",
    trend: "up",
    icon: Leaf,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    previousValue: "202 kg",
  },
  {
    title: "Tax Benefits",
    value: "₹12,450",
    change: "+22.1%",
    trend: "up",
    icon: DollarSign,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    previousValue: "₹10,200",
  },
];

const monthlyDonationData = [
  { month: "Aug", donations: 12, meals: 156, kg: 45 },
  { month: "Sep", donations: 15, meals: 210, kg: 62 },
  { month: "Oct", donations: 18, meals: 285, kg: 78 },
  { month: "Nov", donations: 21, meals: 345, kg: 95 },
  { month: "Dec", donations: 24, meals: 420, kg: 112 },
  { month: "Jan", donations: 28, meals: 520, kg: 156 },
];

const weeklyData = [
  { day: "Mon", donations: 4, meals: 85 },
  { day: "Tue", donations: 3, meals: 62 },
  { day: "Wed", donations: 5, meals: 98 },
  { day: "Thu", donations: 6, meals: 125 },
  { day: "Fri", donations: 8, meals: 180 },
  { day: "Sat", donations: 7, meals: 156 },
  { day: "Sun", donations: 2, meals: 45 },
];

const foodCategoryData = [
  { category: "Cooked Food", percentage: 45, meals: 401, color: "bg-orange-500" },
  { category: "Bakery", percentage: 25, meals: 223, color: "bg-amber-500" },
  { category: "Fruits", percentage: 15, meals: 134, color: "bg-green-500" },
  { category: "Raw Vegetables", percentage: 10, meals: 89, color: "bg-emerald-500" },
  { category: "Dairy", percentage: 5, meals: 45, color: "bg-blue-500" },
];

const ngoPartnershipData = [
  { name: "Hope Foundation", donations: 42, meals: 580, percentage: 35 },
  { name: "Community Kitchen", donations: 35, meals: 485, percentage: 28 },
  { name: "Care Center", donations: 28, meals: 392, percentage: 22 },
  { name: "Children's Home", donations: 18, meals: 245, percentage: 15 },
];

const environmentalImpact = {
  co2Saved: 234,
  treesEquivalent: 12,
  waterSaved: 15600,
  landfillDiverted: 156,
};

const availableReports = [
  { 
    name: "Monthly Donation Report", 
    icon: "📊", 
    desc: "Detailed breakdown of all donations",
    type: "PDF",
    size: "2.4 MB",
    date: "Jan 2025"
  },
  { 
    name: "Tax Benefit Certificate", 
    icon: "📄", 
    desc: "Documentation for tax exemptions (80G)",
    type: "PDF",
    size: "1.2 MB",
    date: "FY 2024-25"
  },
  { 
    name: "Environmental Impact Report", 
    icon: "🌍", 
    desc: "CO2 saved and waste diverted metrics",
    type: "PDF",
    size: "3.1 MB",
    date: "Jan 2025"
  },
  { 
    name: "NGO Partnership Summary", 
    icon: "🤝", 
    desc: "Summary of all NGO collaborations",
    type: "Excel",
    size: "856 KB",
    date: "Jan 2025"
  },
  { 
    name: "Complete Donation History", 
    icon: "📋", 
    desc: "All donations with full details",
    type: "Excel",
    size: "1.8 MB",
    date: "Jan 2025"
  },
  { 
    name: "Annual Impact Summary", 
    icon: "🏆", 
    desc: "Year-end summary and achievements",
    type: "PDF",
    size: "4.2 MB",
    date: "2024"
  },
];

const timeFilters = ["This Week", "This Month", "Last 3 Months", "This Year", "All Time"];

export default function RestaurantAnalytics() {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("This Month");
  const maxDonations = Math.max(...monthlyDonationData.map(d => d.donations));
  const maxWeeklyDonations = Math.max(...weeklyData.map(d => d.donations));

  const handleExportPDF = () => {
    // Simulate PDF export
    alert("Exporting Analytics Report as PDF...");
  };

  const handleExportExcel = () => {
    // Simulate Excel export
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
            <BarChart3 className="h-8 w-8 text-orange-500" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your donation impact and generate reports
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white" onClick={handleExportPDF}>
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
            className={selectedTimeFilter === filter ? "bg-orange-500 hover:bg-orange-600" : ""}
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Donations Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Donation Trend</h2>
                <p className="text-sm text-muted-foreground">Monthly donations over 6 months</p>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                +133% growth
              </Badge>
            </div>

            {/* Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-3">
              {monthlyDonationData.map((data, index) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {data.donations} donations<br/>
                      {data.meals} meals<br/>
                      {data.kg} kg
                    </div>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(data.donations / maxDonations) * 180}px` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg cursor-pointer hover:from-orange-600 hover:to-orange-500 transition-colors"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span className="text-xs text-muted-foreground">Donations</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Total: <span className="font-semibold text-foreground">118 donations</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Food Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Food Categories</h2>
                <p className="text-sm text-muted-foreground">Distribution by food type</p>
              </div>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>

            {/* Donut Chart Visualization */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg className="h-40 w-40 transform -rotate-90">
                  {foodCategoryData.reduce((acc, item, index) => {
                    const previousPercentage = foodCategoryData
                      .slice(0, index)
                      .reduce((sum, i) => sum + i.percentage, 0);
                    const circumference = 2 * Math.PI * 54;
                    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((previousPercentage / 100) * circumference);
                    
                    const colors = ["#f97316", "#f59e0b", "#22c55e", "#10b981", "#3b82f6"];
                    
                    acc.push(
                      <circle
                        key={item.category}
                        cx="80"
                        cy="80"
                        r="54"
                        fill="none"
                        stroke={colors[index]}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                      />
                    );
                    return acc;
                  }, [] as JSX.Element[])}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">892</p>
                    <p className="text-xs text-muted-foreground">Total Meals</p>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                {foodCategoryData.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-foreground">{item.category}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Performance & Environmental Impact */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Weekly Performance</h2>
                <p className="text-sm text-muted-foreground">This week's donation activity</p>
              </div>
              <Badge variant="outline">
                <Calendar className="h-3 w-3 mr-1" />
                This Week
              </Badge>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="space-y-3">
              {weeklyData.map((data, index) => (
                <div key={data.day} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-8">{data.day}</span>
                  <div className="flex-1 h-8 bg-muted/30 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(data.donations / maxWeeklyDonations) * 100}%` }}
                      transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg flex items-center justify-end pr-2"
                    >
                      <span className="text-xs text-white font-medium">{data.donations}</span>
                    </motion.div>
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">{data.meals} meals</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Week Total</p>
                <p className="text-lg font-semibold text-foreground">35 donations</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Best Day</p>
                <p className="text-lg font-semibold text-green-500">Friday (8)</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Environmental Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
                Eco Hero
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
                  transition={{ delay: 0.5 + index * 0.1 }}
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
                🎉 You've saved equivalent of <strong>12 trees</strong> worth of CO2 this month!
              </p>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* NGO Partnership Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                NGO Partnership Analytics
              </h2>
              <p className="text-sm text-muted-foreground">Donation distribution across partner NGOs</p>
            </div>
            <Button variant="outline" size="sm">
              View All Partners
            </Button>
          </div>

          <div className="space-y-4">
            {ngoPartnershipData.map((ngo, index) => (
              <motion.div
                key={ngo.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">
                      {index === 0 ? "🏠" : index === 1 ? "🍳" : index === 2 ? "💚" : "👶"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{ngo.name}</p>
                      <p className="text-xs text-muted-foreground">{ngo.donations} donations • {ngo.meals} meals</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{ngo.percentage}%</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ngo.percentage}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Achievements & Goals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Achievements & Goals
            </h2>
            <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
              <Zap className="h-3 w-3 mr-1" />
              Level 4 Donor
            </Badge>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { 
                title: "Monthly Goal", 
                current: 28, 
                target: 30, 
                unit: "donations",
                icon: <Target className="h-5 w-5" />,
                color: "text-orange-500",
                bgColor: "bg-orange-500"
              },
              { 
                title: "Meals Target", 
                current: 892, 
                target: 1000, 
                unit: "meals",
                icon: <Utensils className="h-5 w-5" />,
                color: "text-green-500",
                bgColor: "bg-green-500"
              },
              { 
                title: "NGO Partners", 
                current: 8, 
                target: 10, 
                unit: "partners",
                icon: <Users className="h-5 w-5" />,
                color: "text-blue-500",
                bgColor: "bg-blue-500"
              },
            ].map((goal, index) => (
              <motion.div
                key={goal.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + index * 0.1 }}
                className="p-4 rounded-xl bg-muted/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={goal.color}>{goal.icon}</div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round((goal.current / goal.target) * 100)}%
                  </span>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-medium text-foreground">{goal.title}</p>
                  <p className="text-lg font-bold text-foreground">
                    {goal.current} <span className="text-sm text-muted-foreground font-normal">/ {goal.target} {goal.unit}</span>
                  </p>
                </div>
                <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                    className={`h-full ${goal.bgColor} rounded-full`}
                  />
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
              <Download className="h-5 w-5 text-orange-500" />
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-2xl">
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
                  <p className="text-xs text-muted-foreground truncate">{report.desc}</p>
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

      {/* Quick Export Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Need a custom report?</h3>
              <p className="text-sm text-muted-foreground">
                Export your analytics data in your preferred format
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                Excel (.xlsx)
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2 text-red-600" />
                PDF Report
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                CSV Data
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}