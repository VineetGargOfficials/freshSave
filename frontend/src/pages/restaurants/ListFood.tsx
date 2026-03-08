// src/pages/restaurants/ListFood.tsx
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  Clock,
  MapPin,
  Package,
  Sparkles,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ListFood() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-8 w-8 text-orange-500" />
          List Surplus Food
        </h1>
        <p className="text-muted-foreground mt-1">
          Share your surplus food with nearby NGOs
        </p>
      </motion.div>

      {/* Coming Soon Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Info className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">This feature is under development</p>
              <p className="text-sm text-muted-foreground">
                You'll be able to list surplus food soon. Here's a preview of how it will work.
              </p>
            </div>
            <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
              Preview
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* Form Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card p-6 relative overflow-hidden">
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Food Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Upload photos</p>
                    <p className="text-sm text-muted-foreground">
                      Take or upload photos of the food
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>
            </div>

            {/* Food Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Food Type</Label>
                <Input placeholder="e.g., Cooked Rice, Curry, Bread" disabled />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input placeholder="e.g., 50 meals, 10 kg" disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the food items, preparation time, etc."
                rows={3}
                disabled
              />
            </div>

            {/* Pickup Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Available Until
                </Label>
                <Input type="datetime-local" disabled />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pickup Location
                </Label>
                <Input placeholder="Pickup address" disabled />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white"
              disabled
            >
              <Sparkles className="h-4 w-4 mr-2" />
              List Food for Donation
            </Button>
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Coming Soon</h3>
            <p className="text-muted-foreground text-center max-w-md px-4">
              You'll be able to list surplus food and connect with NGOs for quick pickups.
            </p>
            <Badge className="mt-4 bg-gradient-to-r from-orange-500 to-red-600 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Expected Q2 2025
            </Badge>
          </div>
        </Card>
      </motion.div>

      {/* How It Will Work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            How It Will Work
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "List Food", desc: "Upload photos and details of surplus food", icon: "📸" },
              { step: "2", title: "NGO Claims", desc: "Nearby NGOs get notified and claim the food", icon: "🔔" },
              { step: "3", title: "Pickup", desc: "NGO picks up the food from your location", icon: "🚚" },
            ].map((item, index) => (
              <div key={index} className="text-center p-4 rounded-xl bg-muted/30">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                  {item.step}
                </div>
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}