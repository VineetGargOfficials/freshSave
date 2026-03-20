import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Loader2, MapPin, MessageSquare, Star, Store, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface RestaurantReview {
  _id: string;
  rating: number;
  comment?: string;
  reviewerRole: "user" | "ngo";
  createdAt: string;
  restaurantAverageRating: number;
  restaurantTotalReviews: number;
  restaurant?: {
    _id?: string;
    name?: string;
    organizationName?: string;
    email?: string;
    address?: {
      city?: string;
      state?: string;
    };
  };
  reviewer?: {
    name?: string;
    organizationName?: string;
    email?: string;
    role?: string;
  };
}

export default function AdminRestaurantReviews() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/restaurant-reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(response.data.data || []);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : null;
      toast.error(message || "Failed to load restaurant reviews");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token, fetchReviews]);

  const averageAcrossAll =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const userReviews = reviews.filter((review) => review.reviewerRole === "user").length;
  const ngoReviews = reviews.filter((review) => review.reviewerRole === "ngo").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading restaurant reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Star className="h-8 w-8 text-amber-500" />
              Restaurant Reviews
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor ratings submitted by users and NGOs for restaurants.
            </p>
          </div>
          <Button variant="outline" onClick={fetchReviews}>
            Refresh
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Total Reviews</p>
          <p className="text-3xl font-bold text-foreground mt-2">{reviews.length}</p>
        </Card>
        <Card className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Average Rating</p>
          <p className="text-3xl font-bold text-foreground mt-2">{averageAcrossAll}/5</p>
        </Card>
        <Card className="glass-card p-5">
          <p className="text-sm text-muted-foreground">Sources</p>
          <p className="text-sm text-foreground mt-2">{userReviews} from users, {ngoReviews} from NGOs</p>
        </Card>
      </div>

      {reviews.length === 0 ? (
        <Card className="glass-card p-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
          <p className="text-sm text-muted-foreground">
            Once users or NGOs rate restaurants, they will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => {
            const restaurantName = review.restaurant?.organizationName || review.restaurant?.name || "Restaurant";
            const reviewerName = review.reviewer?.organizationName || review.reviewer?.name || "Reviewer";
            const location = [review.restaurant?.address?.city, review.restaurant?.address?.state].filter(Boolean).join(", ");

            return (
              <motion.div key={review._id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Card className="glass-card p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary" />
                          {restaurantName}
                        </h3>
                        <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                          {review.rating}/5
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {review.reviewerRole}
                        </Badge>
                        <Badge variant="outline">
                          Avg {review.restaurantAverageRating.toFixed(1)} ({review.restaurantTotalReviews})
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="flex items-center gap-2">
                          <UserRound className="h-4 w-4" />
                          {reviewerName}
                        </p>
                        {location && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {location}
                          </p>
                        )}
                        <p>{new Date(review.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                        <p className="text-sm text-foreground">
                          {review.comment?.trim() || "No written feedback provided."}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
