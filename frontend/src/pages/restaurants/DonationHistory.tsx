// src/pages/restaurants/DonationHistory.tsx
import { motion } from "framer-motion";
import {
  History,
  Calendar,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const mockDonations = [
  {
    id: 1,
    food: "Cooked Rice & Curry",
    quantity: "50 meals",
    ngo: "Food For All NGO",
    date: "2025-03-08",
    status: "completed",
  },
  {
    id: 2,
    food: "Fresh Bread",
    quantity: "30 loaves",
    ngo: "Helping Hands",
    date: "2025-03-07",
    status: "completed",
  },
  {
    id: 3,
    food: "Mixed Vegetables",
    quantity: "20 kg",
    ngo: "Community Kitchen",
    date: "2025-03-06",
    status: "pending",
  },
];

export default function DonationHistory() {
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
            <History className="h-8 w-8 text-orange-500" />
            Donation History
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all your past donations
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

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search donations..."
            className="pl-10"
            disabled
          />
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Donations", value: "0", color: "text-orange-500" },
            { label: "Meals Served", value: "0", color: "text-green-500" },
            { label: "NGOs Helped", value: "0", color: "text-blue-500" },
          ].map((stat, index) => (
            <Card key={index} className="glass-card p-4 text-center relative overflow-hidden">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
                <Badge variant="outline" className="text-xs">
                  Soon
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Donation List Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card p-6 relative overflow-hidden">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Recent Donations
          </h2>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
              <History className="h-10 w-10 text-orange-500" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              No Donation History Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Your donation history will appear here once you start listing surplus food.
            </p>
            <Badge className="bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 border-orange-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Feature Coming Soon
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* Sample Preview (disabled) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Preview: How History Will Look
            </h2>
            <Badge variant="secondary">Sample Data</Badge>
          </div>

          <div className="space-y-3 opacity-60">
            {mockDonations.map((donation, index) => (
              <div
                key={donation.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30"
              >
                <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-xl">
                  🍱
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{donation.food}</p>
                  <p className="text-sm text-muted-foreground">
                    {donation.quantity} • {donation.ngo}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={
                      donation.status === "completed"
                        ? "text-green-600 border-green-500/30"
                        : "text-yellow-600 border-yellow-500/30"
                    }
                  >
                    {donation.status === "completed" ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {donation.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{donation.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}