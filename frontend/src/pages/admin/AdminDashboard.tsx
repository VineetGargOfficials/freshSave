import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  BadgeCheck,
  Building2,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface AdminNgo {
  _id: string;
  name: string;
  email: string;
  organizationName?: string;
  ngoType?: string;
  phoneNumber?: string;
  verificationStatus: "pending" | "under_review" | "verified" | "rejected";
  isVerified: boolean;
  createdAt: string;
  deliveryEnabled?: boolean;
  address?: {
    city?: string;
    state?: string;
  };
}

interface DeliveryPartner {
  _id: string;
  deliveryEnabled: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ngos, setNgos] = useState<AdminNgo[]>([]);
  const [deliveryPartnersCount, setDeliveryPartnersCount] = useState(0);
  const [actionKey, setActionKey] = useState("");
  const [selectedNgo, setSelectedNgo] = useState<AdminNgo | null>(null);
  const [showNgoDetails, setShowNgoDetails] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ngoRes, deliveryRes] = await Promise.all([
        axios.get(`${API_URL}/admin/ngos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/delivery-partners`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setNgos(ngoRes.data.data || []);
      const partners: DeliveryPartner[] = deliveryRes.data.data || [];
      setDeliveryPartnersCount(partners.filter((partner) => partner.deliveryEnabled).length);
    } catch (error: any) {
      console.error("Admin dashboard error:", error);
      toast.error(error.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleNgoStatus = async (ngoId: string, status: AdminNgo["verificationStatus"]) => {
    const key = `${ngoId}-${status}`;
    try {
      setActionKey(key);
      await axios.patch(
        `${API_URL}/admin/ngos/${ngoId}/verification`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`NGO marked as ${status}`);
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update NGO status");
    } finally {
      setActionKey("");
    }
  };

  const pendingCount = ngos.filter((ngo) => ngo.verificationStatus === "pending").length;
  const verifiedCount = ngos.filter((ngo) => ngo.verificationStatus === "verified").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading admin controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Review NGO registrations and open the delivery partnership section separately.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Pending NGO Reviews", value: pendingCount, icon: Building2, tone: "text-amber-600 bg-amber-500/10" },
          { label: "Verified NGOs", value: verifiedCount, icon: BadgeCheck, tone: "text-emerald-600 bg-emerald-500/10" },
          { label: "Delivery Enabled", value: deliveryPartnersCount, icon: Truck, tone: "text-sky-600 bg-sky-500/10" },
        ].map((stat) => (
          <Card key={stat.label} className="glass-card p-5">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${stat.tone}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-foreground mt-3">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">NGO Verification Queue</h2>
          <p className="text-sm text-muted-foreground">
            Every NGO card now includes a full details view before you take action.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/delivery-partnerships")}>
          <Truck className="h-4 w-4 mr-2" />
          Open Delivery Partnerships
        </Button>
      </div>

      <div className="space-y-4">
        {ngos.map((ngo) => (
          <Card key={ngo._id} className="glass-card p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground">
                    {ngo.organizationName || ngo.name}
                  </h3>
                  <Badge variant={ngo.verificationStatus === "verified" ? "default" : "outline"}>
                    {ngo.verificationStatus}
                  </Badge>
                  {ngo.deliveryEnabled && (
                    <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20">
                      Delivery enabled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{ngo.email}</p>
                <p className="text-sm text-muted-foreground">
                  {[ngo.ngoType, ngo.address?.city, ngo.address?.state].filter(Boolean).join(" • ") || "No profile details yet"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedNgo(ngo);
                    setShowNgoDetails(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNgoStatus(ngo._id, "under_review")}
                  disabled={actionKey === `${ngo._id}-under_review`}
                  variant="outline"
                >
                  Review
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNgoStatus(ngo._id, "verified")}
                  disabled={actionKey === `${ngo._id}-verified`}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {actionKey === `${ngo._id}-verified` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleNgoStatus(ngo._id, "rejected")}
                  disabled={actionKey === `${ngo._id}-rejected`}
                  variant="destructive"
                >
                  {actionKey === `${ngo._id}-rejected` ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showNgoDetails} onOpenChange={setShowNgoDetails}>
        <DialogContent className="max-w-2xl">
          {selectedNgo && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNgo.organizationName || selectedNgo.name}</DialogTitle>
                <DialogDescription>
                  Full NGO profile details for admin review
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    {selectedNgo.ngoType || "ngo"}
                  </Badge>
                  <Badge variant={selectedNgo.verificationStatus === "verified" ? "default" : "outline"}>
                    {selectedNgo.verificationStatus}
                  </Badge>
                  {selectedNgo.deliveryEnabled && (
                    <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20">
                      Delivery enabled
                    </Badge>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedNgo.email}</span>
                  </div>
                  {selectedNgo.phoneNumber && (
                    <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedNgo.phoneNumber}</span>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3 sm:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {[selectedNgo.address?.city, selectedNgo.address?.state].filter(Boolean).join(", ") || "Location not added"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground">Verified</p>
                    <p className="text-lg font-semibold text-foreground">{selectedNgo.isVerified ? "Yes" : "No"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground">Delivery Access</p>
                    <p className="text-lg font-semibold text-foreground">{selectedNgo.deliveryEnabled ? "Enabled" : "Disabled"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-lg font-semibold text-foreground">
                      {new Date(selectedNgo.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNgoDetails(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
