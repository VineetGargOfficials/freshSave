// src/pages/ngo/NGOPartners.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Handshake,
  CheckCircle2,
  X,
  Clock,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Building2,
  Eye,
  ArrowLeft,
  Users,
  Globe,
  Utensils,
  Calendar,
  Info,
  MessageSquare,
  Loader2,
  RefreshCw,
  Star,
  AlertCircle,
  UserCheck,
  Package,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Requester {
  _id: string;
  name: string;
  organizationName?: string;
  email: string;
  phoneNumber?: string;
  alternatePhone?: string;
  website?: string;
  address?: {
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fullAddress?: string;
  };
  restaurantType?: string;
  cuisineTypes?: string[];
  seatingCapacity?: number;
  averageMealsPerDay?: number;
  operatingHours?: {
    open?: string;
    close?: string;
  };
  fssaiLicense?: string;
  organizationDescription?: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
}

interface Connection {
  _id: string;
  requester: Requester;
  ngo?: {
    _id: string;
    name: string;
    organizationName?: string;
  };
  requesterRole: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: string;
  updatedAt?: string;
}

interface FoodListing {
  _id: string;
  name: string;
  description: string;
  category: string;
  quantityAvailable: number;
  unit: string;
  expiryDate?: string;
  listingType: 'donation' | 'discount';
  status: string;
  createdAt: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const RESTAURANT_TYPE_ICONS: Record<string, string> = {
  fine_dining: "🍽️",
  casual_dining: "🍴",
  fast_food: "🍔",
  cafe: "☕",
  buffet: "🥗",
  food_truck: "🚚",
  cloud_kitchen: "👨‍🍳",
  catering: "🎪",
  bakery: "🥐",
  other: "🏪",
};

export default function NGOPartners() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"connected" | "requests">("connected");

  // Modal states
  const [selectedRestaurant, setSelectedRestaurant] = useState<Requester | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Listings state
  const [restaurantListings, setRestaurantListings] = useState<FoodListing[]>([]);
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchConnections();
    fetchMyClaims();
  }, [token]);

  const fetchMyClaims = async () => {
    try {
      const res = await axios.get(`${API_URL}/food`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMyClaims(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch my claims", error);
    }
  };

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/connections/my`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const submitRestaurantReview = async () => {
    if (!selectedRestaurant?._id) return;

    try {
      setSubmittingReview(true);
      await axios.post(
        `${API_URL}/restaurants/${selectedRestaurant._id}/reviews`,
        { rating: reviewRating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review submitted successfully");
      setReviewComment("");
      setReviewRating(5);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: "accepted" | "rejected") => {
    setUpdatingStatus(id);
    try {
      const res = await axios.put(
        `${API_URL}/connections/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Request ${newStatus === "accepted" ? "accepted" : "declined"}!`);
        setConnections((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (error: any) {
      console.error("Status update error", error);
      toast.error(error.response?.data?.message || "Failed to update connection status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openDetailsModal = (connection: Connection) => {
    setSelectedRestaurant(connection.requester);
    setSelectedConnection(connection);
    setReviewRating(5);
    setReviewComment("");
    setShowDetailsModal(true);
    if (connection.status === "accepted") {
      fetchRestaurantListings(connection.requester._id);
    } else {
      setRestaurantListings([]);
    }
  };

  const fetchRestaurantListings = async (restaurantId: string) => {
    setLoadingListings(true);
    try {
      const res = await axios.get(`${API_URL}/restaurants/${restaurantId}/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setRestaurantListings(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch restaurant listings", error);
      toast.error("Failed to load active food listings");
    } finally {
      setLoadingListings(false);
    }
  };

  const handleClaim = async (listing: FoodListing) => {
    try {
      const endpoint = `${API_URL}/restaurants/listings/${listing._id}/add-to-fridge`;
      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Item claimed successfully!");
        fetchMyClaims(); // Refresh my local claims list
        if (selectedRestaurant) {
          fetchRestaurantListings(selectedRestaurant._id);
        }
      }
    } catch (error: any) {
      console.error("Claim error:", error);
      toast.error(error.response?.data?.message || "Failed to claim item");
    }
  };

  // Ensure we only show requests where THIS user is the target NGO
  const pendingRequests = connections.filter(
    (c) => c.status === "pending" && c.ngo?._id === user?.id
  );
  const connectedPartners = connections.filter(
    (c) => c.status === "accepted" && c.ngo?._id === user?.id
  );
  const rejectedRequests = connections.filter(
    (c) => c.status === "rejected" && c.ngo?._id === user?.id
  );

  // Stats
  const stats = {
    total: connectedPartners.length + pendingRequests.length,
    connected: connectedPartners.length,
    pending: pendingRequests.length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/ngo")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Handshake className="h-8 w-8 text-primary" />
              Partners & Connections
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage partnership requests from restaurants and users
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchConnections}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TABS - Connected Partners FIRST */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        <Button
          variant={activeTab === "connected" ? "default" : "outline"}
          onClick={() => setActiveTab("connected")}
          className={activeTab === "connected" ? "bg-green-500 hover:bg-green-600" : ""}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Connected Partners
          <Badge className="ml-2 bg-green-600 text-white hover:bg-green-700">
            {connectedPartners.length}
          </Badge>
        </Button>
        <Button
          variant={activeTab === "requests" ? "default" : "outline"}
          onClick={() => setActiveTab("requests")}
          className={activeTab === "requests" ? "bg-orange-500 hover:bg-orange-600" : ""}
        >
          <Clock className="h-4 w-4 mr-2" />
          Pending Requests
          {pendingRequests.length > 0 && (
            <Badge className="ml-2 bg-orange-600 text-white hover:bg-orange-700">
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* CONTENT */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading connections...</span>
        </div>
      ) : activeTab === "connected" ? (
        /* ════════════════════════════════════════════════════════════════════ */
        /* CONNECTED PARTNERS TAB */
        /* ════════════════════════════════════════════════════════════════════ */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {connectedPartners.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <Handshake className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Active Partners
              </h3>
              <p className="text-muted-foreground mb-4">
                Accept partnership requests to build your network of restaurant donors.
              </p>
              <Button
                variant="outline"
                onClick={() => setActiveTab("requests")}
                className="mt-2"
              >
                <Clock className="h-4 w-4 mr-2" />
                View Pending Requests
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {connectedPartners.map((conn, index) => (
                  <motion.div
                    key={conn._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="glass-card p-5 h-full flex flex-col hover:shadow-lg transition-all border-green-500/20 hover:border-green-500/40">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center text-2xl shrink-0">
                          {conn.requester?.restaurantType
                            ? RESTAURANT_TYPE_ICONS[conn.requester.restaurantType] || "🏪"
                            : "🍴"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">
                              {conn.requester?.organizationName || conn.requester?.name}
                            </h3>
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {conn.requester?.restaurantType?.replace(/_/g, " ") || conn.requesterRole}
                          </p>
                          {conn.requester?.address?.city && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {conn.requester.address.city}
                              {conn.requester.address.state && `, ${conn.requester.address.state}`}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {conn.requester?.organizationDescription && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {conn.requester.organizationDescription}
                        </p>
                      )}

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {conn.requester?.averageMealsPerDay != null && (
                          <div className="p-2 rounded-lg bg-muted/30 text-center">
                            <p className="text-lg font-bold text-foreground">
                              {conn.requester.averageMealsPerDay}
                            </p>
                            <p className="text-xs text-muted-foreground">Meals/Day</p>
                          </div>
                        )}
                        {conn.requester?.seatingCapacity != null && (
                          <div className="p-2 rounded-lg bg-muted/30 text-center">
                            <p className="text-lg font-bold text-foreground">
                              {conn.requester.seatingCapacity}
                            </p>
                            <p className="text-xs text-muted-foreground">Seating</p>
                          </div>
                        )}
                      </div>

                      {/* Cuisine Types */}
                      {conn.requester?.cuisineTypes && conn.requester.cuisineTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {conn.requester.cuisineTypes.slice(0, 3).map((cuisine, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {cuisine}
                            </Badge>
                          ))}
                          {conn.requester.cuisineTypes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{conn.requester.cuisineTypes.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Verification Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {conn.requester?.emailVerified && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-500/10 text-green-600 border-green-500/20"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        {conn.requester?.fssaiLicense && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-500/10 text-blue-600 border-blue-500/20"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            FSSAI Licensed
                          </Badge>
                        )}
                      </div>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Actions */}
                      <div className="flex gap-2 mt-auto pt-4 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openDetailsModal(conn)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <div className="flex gap-1">
                          {conn.requester?.phoneNumber && (
                            <Button variant="outline" size="icon" asChild className="shrink-0">
                              <a href={`tel:${conn.requester.phoneNumber}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="outline" size="icon" asChild className="shrink-0">
                            <a href={`mailto:${conn.requester?.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      ) : (
        /* ════════════════════════════════════════════════════════════════════ */
        /* PENDING REQUESTS TAB */
        /* ════════════════════════════════════════════════════════════════════ */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          {pendingRequests.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <Clock className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Pending Requests
              </h3>
              <p className="text-muted-foreground">
                When restaurants request to partner with you, they'll appear here.
              </p>
            </Card>
          ) : (
            <AnimatePresence>
              {pendingRequests.map((conn, index) => (
                <motion.div
                  key={conn._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card p-5 border-orange-500/20 hover:border-orange-500/40 transition-all">
                    <div className="flex flex-col lg:flex-row gap-5">
                      {/* Main Content */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center text-2xl shrink-0">
                            {conn.requester?.restaurantType
                              ? RESTAURANT_TYPE_ICONS[conn.requester.restaurantType] || "🏪"
                              : "🍴"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {conn.requester?.organizationName || conn.requester?.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="capitalize">
                                    {conn.requesterRole}
                                  </Badge>
                                  {conn.requester?.restaurantType && (
                                    <Badge variant="outline" className="capitalize">
                                      {conn.requester.restaurantType.replace(/_/g, " ")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(conn.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            {/* Message */}
                            {conn.message && (
                              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                  <p className="text-sm text-muted-foreground italic">
                                    "{conn.message}"
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 text-sm text-muted-foreground">
                              {conn.requester?.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  <span className="truncate">{conn.requester.email}</span>
                                </div>
                              )}
                              {conn.requester?.phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {conn.requester.phoneNumber}
                                </div>
                              )}
                              {conn.requester?.address?.city && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {conn.requester.address.city}
                                  {conn.requester.address.state && `, ${conn.requester.address.state}`}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 justify-center border-t lg:border-t-0 lg:border-l border-border/50 pt-4 lg:pt-0 lg:pl-5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none"
                          onClick={() => openDetailsModal(conn)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(conn._id, "accepted")}
                          disabled={updatingStatus === conn._id}
                          className="flex-1 lg:flex-none bg-green-500 hover:bg-green-600"
                        >
                          {updatingStatus === conn._id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleUpdateStatus(conn._id, "rejected")}
                          disabled={updatingStatus === conn._id}
                          variant="outline"
                          className="flex-1 lg:flex-none text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* RESTAURANT DETAILS MODAL */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRestaurant && selectedConnection && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl">
                    {selectedRestaurant.restaurantType
                      ? RESTAURANT_TYPE_ICONS[selectedRestaurant.restaurantType] || "🏪"
                      : "🍴"}
                  </div>
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      {selectedRestaurant.organizationName || selectedRestaurant.name}
                      {selectedConnection.status === "accepted" && (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                      {selectedConnection.status === "pending" && (
                        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="capitalize">
                      {selectedRestaurant.restaurantType?.replace(/_/g, " ") || "Restaurant"}
                      {selectedRestaurant.createdAt &&
                        ` • Member since ${new Date(selectedRestaurant.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Connection Message */}
                {selectedConnection.message && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          Connection Message
                        </p>
                        <p className="text-sm text-muted-foreground italic">
                          "{selectedConnection.message}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedRestaurant.organizationDescription && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">About</h4>
                    <p className="text-muted-foreground">
                      {selectedRestaurant.organizationDescription}
                    </p>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Contact Information</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedRestaurant.email}</span>
                    </div>
                    {selectedRestaurant.phoneNumber && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedRestaurant.phoneNumber}</span>
                      </div>
                    )}
                    {selectedRestaurant.alternatePhone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedRestaurant.alternatePhone} (Alt)</span>
                      </div>
                    )}
                    {selectedRestaurant.website && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={selectedRestaurant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                        >
                          {selectedRestaurant.website}
                        </a>
                      </div>
                    )}
                    {(selectedRestaurant.address?.fullAddress ||
                      selectedRestaurant.address?.city) && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 sm:col-span-2">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">
                            {selectedRestaurant.address.fullAddress ||
                              [
                                selectedRestaurant.address.street,
                                selectedRestaurant.address.area,
                                selectedRestaurant.address.city,
                                selectedRestaurant.address.state,
                                selectedRestaurant.address.zipCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Restaurant Stats */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Restaurant Details</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {selectedRestaurant.averageMealsPerDay != null && (
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <Utensils className="h-5 w-5 text-primary mx-auto mb-1" />
                        <p className="text-xl font-bold text-foreground">
                          {selectedRestaurant.averageMealsPerDay}
                        </p>
                        <p className="text-xs text-muted-foreground">Meals/Day</p>
                      </div>
                    )}
                    {selectedRestaurant.seatingCapacity != null && (
                      <div className="p-3 rounded-lg bg-muted/30 text-center">
                        <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-xl font-bold text-foreground">
                          {selectedRestaurant.seatingCapacity}
                        </p>
                        <p className="text-xs text-muted-foreground">Seating</p>
                      </div>
                    )}
                    {selectedRestaurant.operatingHours?.open && (
                      <div className="p-3 rounded-lg bg-muted/30 text-center sm:col-span-2">
                        <Clock className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-foreground">
                          {selectedRestaurant.operatingHours.open} -{" "}
                          {selectedRestaurant.operatingHours.close}
                        </p>
                        <p className="text-xs text-muted-foreground">Operating Hours</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cuisine Types */}
                {selectedRestaurant.cuisineTypes &&
                  selectedRestaurant.cuisineTypes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Cuisine Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRestaurant.cuisineTypes.map((cuisine, index) => (
                          <Badge key={index} variant="outline" className="py-1.5">
                            {cuisine}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Verification & Licenses */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Verification</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRestaurant.emailVerified ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 py-1.5">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Email Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 py-1.5">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Email Not Verified
                      </Badge>
                    )}
                    {selectedRestaurant.fssaiLicense && (
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 py-1.5">
                        <Star className="h-4 w-4 mr-1" />
                        FSSAI: {selectedRestaurant.fssaiLicense}
                      </Badge>
                    )}
                    {selectedRestaurant.isVerified && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20 py-1.5">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Verified Restaurant
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Connection Info */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Connection Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Request Sent:</span>
                      <span className="text-foreground">
                        {new Date(selectedConnection.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {selectedConnection.status === "accepted" && selectedConnection.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Partnership Since:</span>
                        <span className="text-foreground">
                          {new Date(selectedConnection.updatedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ACTIVE LISTINGS SECTION */}
                {selectedConnection.status === "accepted" && selectedConnection.requesterRole === 'restaurant' && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-lg flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        Current Food Items
                        <Badge variant="secondary" className="ml-2">
                          {restaurantListings.length}
                        </Badge>
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => fetchRestaurantListings(selectedRestaurant._id)}
                        disabled={loadingListings}
                      >
                        <RefreshCw className={cn("h-3 w-3 mr-1", loadingListings && "animate-spin")} />
                        Refresh
                      </Button>
                    </div>

                    {loadingListings ? (
                      <div className="py-8 flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                        <p className="text-xs text-muted-foreground">Loading listings...</p>
                      </div>
                    ) : restaurantListings.length === 0 ? (
                      <div className="py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                        <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No active listings from this partner currently.</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {restaurantListings.map((listing) => (
                          <div
                            key={listing._id}
                            className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h5 className="font-bold text-sm truncate">{listing.name}</h5>
                                <Badge variant="outline" className="text-[10px] py-0 h-4 uppercase">
                                  {listing.category}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                                {listing.description}
                              </p>
                              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1 font-medium text-foreground">
                                  <Package className="h-3 w-3 text-primary" />
                                  {listing.quantityAvailable} {listing.unit}
                                </span>
                                {listing.expiryDate && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Exp: {new Date(listing.expiryDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="shrink-0 h-8 rounded-lg bg-primary text-white hover:bg-primary/90"
                              onClick={() => handleClaim(listing)}
                            >
                              Claim
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-4 text-[10px] text-muted-foreground text-center italic">
                      Listings shown are currently active and available for pickup.
                    </p>
                  </div>
                )}

                {/* HISTORY / CLAIMED BY US SECTION */}
                {selectedConnection.status === "accepted" && selectedConnection.requesterRole === 'restaurant' && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-bold text-lg flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Collection History
                    </h4>

                    {myClaims.filter(c => c.notes?.includes(selectedRestaurant?.organizationName || '')).length > 0 ? (
                      <div className="space-y-3">
                        {myClaims
                          .filter(c => c.notes?.includes(selectedRestaurant?.organizationName || ''))
                          .map((claim) => (
                            <div
                              key={claim._id}
                              className="p-3 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center justify-between"
                            >
                              <div>
                                <p className="text-sm font-bold text-foreground">{claim.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  Rescued on {new Date(claim.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className="bg-green-500/10 text-green-600 border-none text-[10px]">
                                Collected
                              </Badge>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="py-6 bg-muted/10 border border-border rounded-2xl text-center">
                        <p className="text-xs text-muted-foreground italic">You haven't collected any items from this partner yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedConnection.status === "accepted" && selectedConnection.requesterRole === 'restaurant' && (
                  <div className="pt-4 border-t border-border space-y-4">
                    <div>
                      <h4 className="font-bold text-lg flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-amber-500" />
                        Rate This Restaurant
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Share your experience. This feedback will be visible to admin.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          className="rounded-lg p-2 hover:bg-muted"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              value <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      placeholder="Tell admin how this restaurant handled food quality, coordination, and pickup support"
                    />

                    <div className="flex justify-end">
                      <Button onClick={submitRestaurantReview} disabled={submittingReview}>
                        {submittingReview ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Star className="h-4 w-4 mr-2" />}
                        Submit Review
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                {/* Quick contact buttons */}
                {selectedConnection.status === "accepted" && (
                  <div className="flex gap-2 mr-auto">
                    {selectedRestaurant.phoneNumber && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${selectedRestaurant.phoneNumber}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${selectedRestaurant.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  </div>
                )}

                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>

                {/* Action buttons for pending requests */}
                {selectedConnection.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-500 hover:bg-red-500/10"
                      onClick={() => {
                        handleUpdateStatus(selectedConnection._id, "rejected");
                        setShowDetailsModal(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                    <Button
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => {
                        handleUpdateStatus(selectedConnection._id, "accepted");
                        setShowDetailsModal(false);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept Request
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
