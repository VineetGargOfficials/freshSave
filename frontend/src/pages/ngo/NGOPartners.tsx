import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Handshake, CheckCircle2, X, Clock, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Connection = {
  _id: string;
  requester: {
    _id: string;
    name: string;
    organizationName?: string;
    email: string;
    phoneNumber?: string;
    address?: { city?: string; state?: string };
  };
  ngo?: {
    _id: string;
    name: string;
    organizationName?: string;
  };
  requesterRole: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: string;
};

export default function NGOPartners() {
  const { token, user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"requests" | "connected">("requests");

  useEffect(() => {
    fetchConnections();
  }, [token]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/connections/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setConnections(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch connections", error);
      toast.error("Failed to fetch connection requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "accepted" | "rejected") => {
    try {
      const res = await axios.put(`${API_URL}/connections/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(`Request ${newStatus}!`);
        // Update local state smoothly
        setConnections(prev => prev.map(c => c._id === id ? { ...c, status: newStatus } : c));
      }
    } catch (error: any) {
      console.error("Status update error", error);
      toast.error(error.response?.data?.message || "Failed to update connection status");
    }
  };

  // Ensure we only show requests where THIS user is the target NGO
  const pendingRequests = connections.filter(c => c.status === "pending" && c.ngo?._id === user?.id);
  const connectedPartners = connections.filter(c => c.status === "accepted" && c.ngo?._id === user?.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Handshake className="h-8 w-8 text-primary" />
          Partners & Connections
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage partnership requests from restaurants and individuals
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "requests" ? "default" : "outline"}
          onClick={() => setActiveTab("requests")}
          className={activeTab === "requests" ? "bg-primary text-primary-foreground" : ""}
        >
          <Clock className="h-4 w-4 mr-2" />
          Pending Requests
          {pendingRequests.length > 0 && (
            <Badge className="ml-2 bg-orange-500 text-white hover:bg-orange-600">{pendingRequests.length}</Badge>
          )}
        </Button>
        <Button
          variant={activeTab === "connected" ? "default" : "outline"}
          onClick={() => setActiveTab("connected")}
          className={activeTab === "connected" ? "bg-primary text-primary-foreground" : ""}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Connected Partners
          <Badge className="ml-2 bg-green-500 text-white hover:bg-green-600">{connectedPartners.length}</Badge>
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Loading connections...</p>
        </div>
      ) : activeTab === "requests" ? (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium">No pending requests</p>
              <p className="text-muted-foreground">When restaurants request to partner with you, they'll appear here.</p>
            </Card>
          ) : (
            pendingRequests.map(conn => (
              <motion.div key={conn._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="glass-card p-5 border-orange-500/20">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{conn.requester?.organizationName || conn.requester?.name}</h3>
                          <Badge variant="outline" className="capitalize mt-1">
                            {conn.requesterRole}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conn.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {conn.message && (
                        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm">
                          <p className="italic text-muted-foreground">"{conn.message}"</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm text-muted-foreground">
                        {conn.requester?.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4"/> {conn.requester.email}</div>}
                        {conn.requester?.phoneNumber && <div className="flex items-center gap-2"><Phone className="h-4 w-4"/> {conn.requester.phoneNumber}</div>}
                        {conn.requester?.address?.city && <div className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {conn.requester.address.city}</div>}
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-4">
                      <Button onClick={() => handleUpdateStatus(conn._id, 'accepted')} className="flex-1 bg-green-500 hover:bg-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Accept
                      </Button>
                      <Button onClick={() => handleUpdateStatus(conn._id, 'rejected')} variant="outline" className="flex-1 text-red-500 hover:bg-red-500/10 hover:text-red-600">
                        <X className="h-4 w-4 mr-2" /> Decline
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {connectedPartners.length === 0 ? (
            <Card className="glass-card p-12 text-center col-span-2">
              <Handshake className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium">No active partners</p>
              <p className="text-muted-foreground">Accept requests to build your partner network.</p>
            </Card>
          ) : (
            connectedPartners.map(conn => (
              <motion.div key={conn._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="glass-card p-5 border-green-500/20 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg truncate pr-2">{conn.requester?.organizationName || conn.requester?.name}</h3>
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 capitalize mt-1">
                         Connected {conn.requesterRole}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 mt-auto text-sm text-muted-foreground">
                    {conn.requester?.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4"/> {conn.requester.email}</div>}
                    {conn.requester?.phoneNumber && <div className="flex items-center gap-2"><Phone className="h-4 w-4"/> {conn.requester.phoneNumber}</div>}
                    {conn.requester?.address?.city && <div className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {conn.requester.address.city}</div>}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
