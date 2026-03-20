import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileText,
  Leaf,
  Loader2,
  Truck,
  Users,
  Utensils,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ClaimItem {
  _id: string;
  quantity?: number | string;
  status: string;
  claimedAt: string;
  partnerName?: string;
}

interface FoodItem {
  _id: string;
  status: string;
}

interface ConnectedListing {
  _id: string;
  createdAt: string;
}

interface Connection {
  _id: string;
  status: string;
  requesterRole: string;
}

const timeFilters = ["This Month", "Last 3 Months", "This Year", "All Time"];
const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
const monthLabel = (date: Date) => date.toLocaleDateString("en-IN", { month: "short" });

export default function NGOAnalytics() {
  const { token } = useAuth();
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("This Month");
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [connectedListings, setConnectedListings] = useState<ConnectedListing[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [claimsRes, foodRes, listingsRes, connectionsRes] = await Promise.all([
          axios.get(`${API_URL}/donations/my-claims`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/food`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/restaurants/connected/listings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/connections/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const donationClaims = (claimsRes.data.data || []).map((item: any) => ({
          _id: item._id,
          quantity: item.quantityAvailable || item.quantity || item.servings || 1,
          status: item.status,
          claimedAt: item.claimedAt || item.createdAt,
          partnerName: item.donor?.organizationName || item.donor?.name || "User",
        }));

        const foodClaims = (foodRes.data.data || []).map((item: any) => ({
          _id: item._id,
          quantity: 1,
          status: item.status,
          claimedAt: item.createdAt,
          partnerName: item.notes?.includes("Added from")
            ? item.notes.split("Added from ")[1]?.split(" restaurant")[0] || "Restaurant"
            : "Restaurant Partner",
        }));

        setClaims([...donationClaims, ...foodClaims]);
        setFoodItems(foodRes.data.data || []);
        setConnectedListings(listingsRes.data.data || []);
        setConnections(connectionsRes.data.data || []);
      } catch (error: any) {
        console.error("NGO analytics error:", error);
        toast.error(error.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAnalytics();
  }, [token]);

  const filteredClaims = useMemo(() => {
    if (selectedTimeFilter === "All Time") return claims;
    const now = new Date();
    const months = selectedTimeFilter === "This Month" ? 1 : selectedTimeFilter === "Last 3 Months" ? 3 : 12;
    const cutoff = new Date(now);
    cutoff.setMonth(now.getMonth() - months);
    return claims.filter((claim) => new Date(claim.claimedAt) >= cutoff);
  }, [claims, selectedTimeFilter]);

  const monthlySeries = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: getMonthKey(date),
        month: monthLabel(date),
        meals: 0,
        pickups: 0,
      };
    });

    const map = new Map(months.map((item) => [item.key, item]));
    claims.forEach((claim) => {
      const date = new Date(claim.claimedAt);
      const entry = map.get(getMonthKey(date));
      if (entry) {
        entry.pickups += 1;
        entry.meals += Number(claim.quantity || 0) || 1;
      }
    });
    return months;
  }, [claims]);

  const partnerBreakdown = useMemo(() => {
    const counts = new Map<string, { name: string; pickups: number; meals: number }>();
    filteredClaims.forEach((claim) => {
      const name = claim.partnerName || "Unknown Partner";
      const current = counts.get(name) || { name, pickups: 0, meals: 0 };
      current.pickups += 1;
      current.meals += Number(claim.quantity || 0) || 1;
      counts.set(name, current);
    });
    const total = filteredClaims.length || 1;
    return Array.from(counts.values())
      .sort((a, b) => b.meals - a.meals)
      .slice(0, 5)
      .map((item) => ({ ...item, percentage: Math.round((item.pickups / total) * 100) }));
  }, [filteredClaims]);

  const peakHours = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, index) => ({ hour: index, pickups: 0 }));
    filteredClaims.forEach((claim) => {
      const date = new Date(claim.claimedAt);
      hours[date.getHours()].pickups += 1;
    });
    return hours
      .sort((a, b) => b.pickups - a.pickups)
      .slice(0, 4)
      .map((item) => ({
        label: `${((item.hour + 11) % 12) + 1} ${item.hour >= 12 ? "PM" : "AM"}`,
        pickups: item.pickups,
      }));
  }, [filteredClaims]);

  const totalMeals = filteredClaims.reduce((sum, claim) => sum + (Number(claim.quantity || 0) || 1), 0);
  const completedPickups = filteredClaims.filter((claim) => claim.status === "picked_up" || claim.status === "distributed").length;
  const restaurantPartners = connections.filter((c) => c.status === "accepted" && c.requesterRole === "restaurant").length;
  const communityPartners = connections.filter((c) => c.status === "accepted" && c.requesterRole === "user").length;
  const distributedItems = foodItems.filter((item) => item.status === "consumed").length;
  const estimatedCo2Saved = totalMeals * 0.27;
  const maxMeals = Math.max(...monthlySeries.map((item) => item.meals), 1);
  const maxPeak = Math.max(...peakHours.map((item) => item.pickups), 1);
  const summaryReports = [
    {
      name: "Summary Certificate",
      description: `Certified summary of ${filteredClaims.length} claims and ${totalMeals} meals rescued`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "CSR Community Impact Report",
      description: `CSR-ready impact with ${estimatedCo2Saved.toFixed(0)} kg CO2 saved across ${restaurantPartners + communityPartners} partners`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "Annual Summary Report",
      description: `Annual view with ${filteredClaims.length} claims, ${completedPickups} completed pickups, and ${restaurantPartners + communityPartners} active partners`,
      type: "PDF",
      period: "This Year",
    },
    {
      name: "Tax Beneficiary Report",
      description: `Tax beneficiary summary for supported meal distribution and verified partner claims`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "Grant Utilization Certificate",
      description: `Utilization certificate format for grants, CSR and food rescue program support`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "Monthly Community Impact Report",
      description: `Monthly impact report covering distributed items, rescue partners, and pickup completion`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "Rescue Distribution Ledger",
      description: `Ledger covering distributed items (${distributedItems}) and completed pickups (${completedPickups})`,
      type: "Excel",
      period: selectedTimeFilter,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading NGO analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">Live rescue metrics from claims, pickups, and connected partners</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Excel export can be added next")}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" onClick={() => toast.success("PDF export can be added next")}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-2">
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
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Meals Collected", value: `${totalMeals}`, helper: `${filteredClaims.length} claims`, icon: Utensils, tone: "bg-green-500/10 text-green-500" },
          { label: "Completed Pickups", value: `${completedPickups}`, helper: `${connectedListings.length} available listings`, icon: Truck, tone: "bg-blue-500/10 text-blue-500" },
          { label: "Connected Partners", value: `${restaurantPartners + communityPartners}`, helper: `${restaurantPartners} restaurants`, icon: Users, tone: "bg-purple-500/10 text-purple-500" },
          { label: "CO2 Saved", value: `${estimatedCo2Saved.toFixed(0)} kg`, helper: "estimated", icon: Leaf, tone: "bg-emerald-500/10 text-emerald-500" },
        ].map((metric) => (
          <Card key={metric.label} className="glass-card p-4">
            <div className={`p-2 rounded-xl w-fit ${metric.tone}`}>
              <metric.icon className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.helper}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Meals Distribution Trend</h2>
              <p className="text-sm text-muted-foreground">Claimed meals over the last 6 months</p>
            </div>
            <Badge variant="outline">6 Months</Badge>
          </div>
          <div className="h-64 flex items-end justify-between gap-3">
            {monthlySeries.map((item) => (
              <div key={item.key} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg" style={{ height: `${(item.meals / maxMeals) * 180 || 6}px` }} />
                <span className="text-xs text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                Environmental Impact
              </h2>
              <p className="text-sm text-muted-foreground">Estimated from live rescue data</p>
            </div>
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Live</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "CO2 Saved", value: `${estimatedCo2Saved.toFixed(0)} kg` },
              { label: "Distributed Items", value: `${distributedItems}` },
              { label: "Meals Rescued", value: `${totalMeals}` },
              { label: "Community Partners", value: `${communityPartners}` },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-background/50 text-center">
                <p className="text-xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-500" />
                Partner Analytics
              </h2>
              <p className="text-sm text-muted-foreground">Top rescue sources by pickups</p>
            </div>
          </div>
          <div className="space-y-4">
            {partnerBreakdown.length > 0 ? partnerBreakdown.map((partner) => (
              <div key={partner.name}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{partner.name}</p>
                    <p className="text-xs text-muted-foreground">{partner.pickups} pickups • {partner.meals} meals</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{partner.percentage}%</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" style={{ width: `${partner.percentage}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">No partner data yet.</p>}
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Peak Pickup Hours
              </h2>
              <p className="text-sm text-muted-foreground">Most active claim times</p>
            </div>
          </div>
          <div className="space-y-3">
            {peakHours.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-14">{item.label}</span>
                <div className="flex-1 h-8 bg-muted/30 rounded-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-lg flex items-center justify-end pr-2" style={{ width: `${(item.pickups / maxPeak) * 100 || 0}%` }}>
                    {item.pickups > 0 && <span className="text-xs text-white font-medium">{item.pickups}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Connection Snapshot
            </h2>
            <Badge variant="outline">{connections.length} requests</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Restaurant Partners</p>
              <p className="text-2xl font-bold text-foreground mt-1">{restaurantPartners}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Community Donors</p>
              <p className="text-2xl font-bold text-foreground mt-1">{communityPartners}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Available Listings</p>
              <p className="text-2xl font-bold text-foreground mt-1">{connectedListings.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Distributed</p>
              <p className="text-2xl font-bold text-foreground mt-1">{distributedItems}</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Rescue Summary
            </h2>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Dynamic</Badge>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Claims Tracked</p>
              <p className="text-2xl font-bold text-foreground mt-1">{filteredClaims.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Food Inventory Items</p>
              <p className="text-2xl font-bold text-foreground mt-1">{foodItems.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Completed Pickups</p>
              <p className="text-2xl font-bold text-foreground mt-1">{completedPickups}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            Summary Certificates, CSR & Compliance Reports
          </h2>
          <Badge variant="outline">{summaryReports.length} documents</Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaryReports.map((report) => (
            <div key={report.name} className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">{report.name}</p>
                <Badge variant="outline">{report.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{report.description}</p>
              <p className="text-xs text-muted-foreground mt-2">Period: {report.period}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => toast.success(`${report.name} ready for download flow`)}
              >
                Open Document
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="glass-card p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Live Summary</h3>
            <p className="text-sm text-muted-foreground">
              {totalMeals} meals rescued, {completedPickups} completed pickups, {restaurantPartners + communityPartners} connected partners, and {estimatedCo2Saved.toFixed(0)} kg CO2 saved.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => toast.success("Excel export can be added next")}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline" onClick={() => toast.success("PDF export can be added next")}>
              <FileText className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
