import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Clock, Plus, Check } from "lucide-react";
import { getDonations, addDonation } from "@/lib/storage";
import { DonationItem } from "@/types/food";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_DONATIONS: Omit<DonationItem, "id" | "createdAt">[] = [
  {
    restaurantName: "Green Bowl Café",
    foodDescription: "20 mixed salad bowls, fresh from today",
    quantity: "20 bowls",
    pickupLocation: "123 Main St, Downtown",
    availableUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: "available",
  },
  {
    restaurantName: "Bread & Butter Bakery",
    foodDescription: "Assorted bread loaves and pastries",
    quantity: "15 items",
    pickupLocation: "456 Oak Ave",
    availableUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: "available",
  },
];

export default function Donations() {
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ restaurantName: "", foodDescription: "", quantity: "", pickupLocation: "", availableUntil: "" });

  useEffect(() => {
    let items = getDonations();
    if (items.length === 0) {
      SAMPLE_DONATIONS.forEach((d) => addDonation(d));
      items = getDonations();
    }
    setDonations(items);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.restaurantName || !form.foodDescription) {
      toast.error("Please fill in required fields");
      return;
    }
    addDonation({ ...form, availableUntil: form.availableUntil || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), status: "available" });
    setDonations(getDonations());
    setOpen(false);
    setForm({ restaurantName: "", foodDescription: "", quantity: "", pickupLocation: "", availableUntil: "" });
    toast.success("Food listed for donation!");
  };

  const statusColors = {
    available: "bg-success/10 text-success",
    claimed: "bg-warning/10 text-warning",
    picked_up: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Food Donations</h1>
          <p className="text-muted-foreground mt-1">Share surplus, reduce waste</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4 mr-1" /> List Food
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>List Surplus Food</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Restaurant / Organization</Label>
                <Input value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} placeholder="Your business name" />
              </div>
              <div className="space-y-2">
                <Label>Food Description</Label>
                <Textarea value={form.foodDescription} onChange={(e) => setForm({ ...form, foodDescription: e.target.value })} placeholder="What food is available?" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 10 meals" />
                </div>
                <div className="space-y-2">
                  <Label>Pickup Location</Label>
                  <Input value={form.pickupLocation} onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })} placeholder="Address" />
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">List for Donation</Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Donation listings */}
      <div className="space-y-3">
        {donations.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="glass-card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">{item.restaurantName}</span>
                </div>
                <Badge className={cn("text-xs", statusColors[item.status])}>{item.status}</Badge>
              </div>
              <p className="text-sm text-foreground mt-2">{item.foodDescription}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{item.pickupLocation}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.quantity}</span>
              </div>
              {item.status === "available" && (
                <Button variant="outline" size="sm" className="mt-3 w-full border-primary text-primary hover:bg-accent" onClick={() => toast.success("Pickup request sent!")}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Request Pickup
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}