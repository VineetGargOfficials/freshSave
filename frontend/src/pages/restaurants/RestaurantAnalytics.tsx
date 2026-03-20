import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  BarChart3,
  Calendar,
  FileSpreadsheet,
  FileText,
  Leaf,
  Loader2,
  Target,
  TrendingUp,
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

interface RestaurantStats {
  total: number;
  active: number;
  soldOut: number;
  expired: number;
  removed: number;
  totalReservations: number;
  byListingType: Record<string, number>;
  byCategory: Record<string, number>;
}

interface RestaurantClaim {
  _id: string;
  quantity: number;
  status: "claimed" | "picked_up" | "distributed" | "cancelled";
  fulfillmentMethod?: "pickup" | "delivery";
  claimedAt: string;
  ngo?: {
    name?: string;
    organizationName?: string;
  };
}

interface RestaurantListing {
  _id: string;
  category: string;
  createdAt: string;
}

interface Connection {
  _id: string;
  status: string;
  requesterRole: string;
}

const timeFilters = ["This Month", "Last 3 Months", "This Year", "All Time"];
const monthLabel = (date: Date) => date.toLocaleDateString("en-IN", { month: "short" });

export default function RestaurantAnalytics() {
  const { token, user } = useAuth();
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("This Month");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [claims, setClaims] = useState<RestaurantClaim[]>([]);
  const [listings, setListings] = useState<RestaurantListing[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const restaurantId = user?.id;

        const [statsRes, claimsRes, connectionsRes, listingsRes] = await Promise.all([
          axios.get(`${API_URL}/restaurants/my/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/restaurants/my/claims`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/connections/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          restaurantId
            ? axios.get(`${API_URL}/restaurants/${restaurantId}/listings`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ data: { data: [] } }),
        ]);

        setStats(statsRes.data.stats || null);
        setClaims(claimsRes.data.data || []);
        setConnections(connectionsRes.data.data || []);
        setListings(listingsRes.data.data || []);
      } catch (error: any) {
        console.error("Restaurant analytics error:", error);
        toast.error(error.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.id) {
      fetchAnalytics();
    }
  }, [token, user?.id]);

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
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: monthLabel(date),
        donations: 0,
        meals: 0,
      };
    });

    const map = new Map(months.map((item) => [item.key, item]));
    listings.forEach((listing) => {
      const date = new Date(listing.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const entry = map.get(key);
      if (entry) entry.donations += 1;
    });
    claims.forEach((claim) => {
      const date = new Date(claim.claimedAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const entry = map.get(key);
      if (entry) entry.meals += Number(claim.quantity || 0);
    });
    return months;
  }, [claims, listings]);

  const weeklySeries = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => ({
      day,
      donations: 0,
      meals: 0,
    }));
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 6);

    listings.forEach((listing) => {
      const date = new Date(listing.createdAt);
      if (date >= cutoff) days[date.getDay()].donations += 1;
    });
    claims.forEach((claim) => {
      const date = new Date(claim.claimedAt);
      if (date >= cutoff) days[date.getDay()].meals += Number(claim.quantity || 0);
    });
    return days;
  }, [claims, listings]);

  const partnerBreakdown = useMemo(() => {
    const counts = new Map<string, { name: string; claims: number; meals: number }>();
    filteredClaims.forEach((claim) => {
      const name = claim.ngo?.organizationName || claim.ngo?.name || "Unknown NGO";
      const current = counts.get(name) || { name, claims: 0, meals: 0 };
      current.claims += 1;
      current.meals += Number(claim.quantity || 0);
      counts.set(name, current);
    });
    const totalClaims = filteredClaims.length || 1;
    return Array.from(counts.values())
      .sort((a, b) => b.meals - a.meals)
      .slice(0, 5)
      .map((item) => ({ ...item, percentage: Math.round((item.claims / totalClaims) * 100) }));
  }, [filteredClaims]);

  const categoryBreakdown = useMemo(() => {
    const total = listings.length || 1;
    return Object.entries(stats?.byCategory || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100),
      }));
  }, [listings.length, stats?.byCategory]);

  const acceptedPartners = connections.filter((c) => c.status === "accepted" && c.requesterRole === "restaurant").length;
  const totalMealsServed = filteredClaims.reduce((sum, claim) => sum + Number(claim.quantity || 0), 0);
  const deliveryClaims = filteredClaims.filter((claim) => claim.fulfillmentMethod === "delivery").length;
  const pickupClaims = filteredClaims.filter((claim) => claim.fulfillmentMethod === "pickup").length;
  const completedClaims = filteredClaims.filter((claim) => claim.status === "picked_up" || claim.status === "distributed").length;
  const estimatedCo2Saved = totalMealsServed * 0.27;
  const maxMonthlyDonations = Math.max(...monthlySeries.map((item) => item.donations), 1);
  const maxWeeklyDonations = Math.max(...weeklySeries.map((item) => item.donations), 1);
  const summaryReports = [
    {
      name: "Summary Certificate",
      description: `Certified summary of ${stats?.total || 0} listings and ${totalMealsServed} meals served`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "CSR Impact Report",
      description: `CSR-ready snapshot with ${estimatedCo2Saved.toFixed(0)} kg CO2 saved and ${acceptedPartners} NGO partners`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "Annual Summary Report",
      description: `Year-level performance view with ${stats?.total || 0} listings, ${completedClaims} completed claims, and ${acceptedPartners} NGO partners`,
      type: "PDF",
      period: "This Year",
    },
    {
      name: "Tax Beneficiary Report",
      description: `Tax support summary based on completed donation impact and verified NGO claim records`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "80G Support Statement",
      description: `Statement format prepared for donation accounting and beneficiary support documentation`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "Monthly Impact Certificate",
      description: `Monthly certificate with category-wise listing and meal fulfillment summary`,
      type: "PDF",
      period: selectedTimeFilter,
    },
    {
      name: "Donation Audit Sheet",
      description: `Audit export of pickup (${pickupClaims}) and delivery (${deliveryClaims}) claim fulfillment`,
      type: "Excel",
      period: selectedTimeFilter,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading restaurant analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            Analytics & Reports
          </h1>
          <p className="text-muted-foreground mt-1">Live metrics from listings, NGO claims, and partnerships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Excel export can be added next")}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white" onClick={() => toast.success("PDF export can be added next")}>
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
            className={selectedTimeFilter === filter ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Food Listed", value: `${stats?.total || 0}`, helper: `${stats?.active || 0} active`, icon: Utensils, tone: "bg-orange-500/10 text-orange-500" },
          { label: "Meals Served", value: `${totalMealsServed}`, helper: `${completedClaims} completed`, icon: TrendingUp, tone: "bg-green-500/10 text-green-500" },
          { label: "CO2 Saved", value: `${estimatedCo2Saved.toFixed(0)} kg`, helper: "estimated", icon: Leaf, tone: "bg-emerald-500/10 text-emerald-500" },
          { label: "NGO Partners", value: `${acceptedPartners}`, helper: `${deliveryClaims} delivery claims`, icon: Users, tone: "bg-blue-500/10 text-blue-500" },
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
              <h2 className="text-lg font-semibold text-foreground">Donation Trend</h2>
              <p className="text-sm text-muted-foreground">Listings created over the last 6 months</p>
            </div>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              6 Months
            </Badge>
          </div>
          <div className="h-64 flex items-end justify-between gap-3">
            {monthlySeries.map((item) => (
              <div key={item.key} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg"
                  style={{ height: `${(item.donations / maxMonthlyDonations) * 180 || 6}px` }}
                />
                <span className="text-xs text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Category Breakdown</h2>
              <p className="text-sm text-muted-foreground">Top listing categories</p>
            </div>
            <Badge variant="outline">{categoryBreakdown.length} categories</Badge>
          </div>
          <div className="space-y-4">
            {categoryBreakdown.length > 0 ? categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">No category data yet.</p>}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Weekly Activity</h2>
              <p className="text-sm text-muted-foreground">Last 7 days listing activity</p>
            </div>
            <Badge variant="outline">This Week</Badge>
          </div>
          <div className="space-y-3">
            {weeklySeries.map((item) => (
              <div key={item.day} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-8">{item.day}</span>
                <div className="flex-1 h-8 bg-muted/30 rounded-lg overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg flex items-center justify-end pr-2" style={{ width: `${(item.donations / maxWeeklyDonations) * 100 || 0}%` }}>
                    {item.donations > 0 && <span className="text-xs text-white font-medium">{item.donations}</span>}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">{item.meals} meals</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-500" />
              Fulfillment Snapshot
            </h2>
            <Badge variant="outline">{filteredClaims.length} claims</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Pickup Claims</p>
              <p className="text-2xl font-bold text-foreground mt-1">{pickupClaims}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Delivery Claims</p>
              <p className="text-2xl font-bold text-foreground mt-1">{deliveryClaims}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground mt-1">{completedClaims}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <p className="text-sm text-muted-foreground">Sold Out Listings</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats?.soldOut || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            NGO Partnership Analytics
          </h2>
        </div>
        <div className="space-y-4">
          {partnerBreakdown.length > 0 ? partnerBreakdown.map((partner) => (
            <div key={partner.name}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-foreground">{partner.name}</p>
                  <p className="text-xs text-muted-foreground">{partner.claims} claims • {partner.meals} meals</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{partner.percentage}%</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${partner.percentage}%` }} />
              </div>
            </div>
          )) : <p className="text-sm text-muted-foreground">No NGO claim data yet.</p>}
        </div>
      </Card>

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

      <Card className="glass-card p-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">Live Summary</h3>
            <p className="text-sm text-muted-foreground">
              {stats?.total || 0} listings, {stats?.active || 0} active, {totalMealsServed} meals served, and {acceptedPartners} NGO partners.
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
