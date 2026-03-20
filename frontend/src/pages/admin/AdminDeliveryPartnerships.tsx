import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Loader2, ShieldCheck, Truck, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface DeliveryPartner {
  _id: string;
  name: string;
  email: string;
  role: "ngo" | "restaurant";
  organizationName?: string;
  deliveryEnabled: boolean;
  deliveryEnabledAt?: string;
  verificationStatus?: string;
  isVerified?: boolean;
  address?: {
    city?: string;
    state?: string;
  };
}

export default function AdminDeliveryPartnerships() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [actionKey, setActionKey] = useState("");

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/delivery-partners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPartners(response.data.data || []);
    } catch (error: any) {
      console.error("Delivery partners error:", error);
      toast.error(error.response?.data?.message || "Failed to load delivery partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPartners();
    }
  }, [token]);

  const handleDeliveryToggle = async (userId: string, deliveryEnabled: boolean) => {
    const key = `${userId}-${deliveryEnabled}`;
    try {
      setActionKey(key);
      await axios.patch(
        `${API_URL}/admin/users/${userId}/delivery`,
        { deliveryEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Delivery ${deliveryEnabled ? "enabled" : "disabled"} successfully`);
      await fetchPartners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update delivery access");
    } finally {
      setActionKey("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading delivery partnerships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Truck className="h-8 w-8 text-primary" />
          Delivery Partnerships
        </h1>
        <p className="text-muted-foreground mt-1">
          Enable or disable delivery access separately for NGOs and restaurants.
        </p>
      </motion.div>

      <div className="space-y-4">
        {partners.map((partner) => (
          <Card key={partner._id} className="glass-card p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground">
                    {partner.organizationName || partner.name}
                  </h3>
                  <Badge variant="outline" className="capitalize">
                    {partner.role}
                  </Badge>
                  {partner.isVerified && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {partner.deliveryEnabled ? (
                    <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20">
                      Delivery enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline">Delivery disabled</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{partner.email}</p>
                <p className="text-sm text-muted-foreground">
                  {[partner.address?.city, partner.address?.state].filter(Boolean).join(" • ") || "Location not added"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleDeliveryToggle(partner._id, true)}
                  disabled={partner.deliveryEnabled || actionKey === `${partner._id}-true`}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  {actionKey === `${partner._id}-true` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4 mr-2" />}
                  Enable Delivery
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeliveryToggle(partner._id, false)}
                  disabled={!partner.deliveryEnabled || actionKey === `${partner._id}-false`}
                >
                  {actionKey === `${partner._id}-false` ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                  Disable
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
