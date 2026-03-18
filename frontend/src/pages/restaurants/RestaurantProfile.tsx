// src/pages/restaurants/RestaurantProfile.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  Calendar,
  Clock,
  Utensils,
  FileText,
  Edit3,
  Save,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Users,
  Truck,
  Star,
  Loader2,
  ArrowLeft,
  Shield,
  Heart,
  TrendingUp,
  Package,
  Award,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import RoleBadges from "@/components/common/RoleBadges";
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────────────────────
const RESTAURANT_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cloud_kitchen", label: "Cloud Kitchen" },
  { value: "catering", label: "Catering Service" },
  { value: "hotel", label: "Hotel / Resort" },
  { value: "cafe", label: "Cafe / Coffee Shop" },
  { value: "bakery", label: "Bakery" },
  { value: "food_truck", label: "Food Truck" },
  { value: "corporate_canteen", label: "Corporate Canteen" },
  { value: "school_canteen", label: "School / College Canteen" },
  { value: "other", label: "Other" },
];

const CUISINES = [
  "Indian", "Chinese", "Italian", "Mexican", "Continental", "Fast Food",
  "South Indian", "North Indian", "Mughlai", "Seafood", "Vegan", "Bakery", "Multi-Cuisine", "Other"
];

const DONATION_MODES = [
  { value: "pickup_only", label: "Pickup Only", desc: "NGO comes to collect" },
  { value: "delivery", label: "Delivery", desc: "We deliver to NGO" },
  { value: "both", label: "Both", desc: "Either way works" },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// ── Mock Stats ────────────────────────────────────────────────────────────────
const MOCK_STATS = {
  totalDonations: 156,
  mealsServed: 2840,
  ngoPartnersConnected: 8,
  activeListing: 12,
  pendingConnections: 3,
  co2Saved: "234 kg",
};

export default function RestaurantProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Form state - initialized from user data
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    alternatePhone: "",
    website: "",
    bio: "",
    organizationName: "",
    organizationType: "",
    fssaiLicense: "",
    cuisineTypes: [] as string[],
    seatingCapacity: "",
    dailySurplusCapacity: "",
    donationMode: "pickup_only",
    isHalalCertified: false,
    isVegetarianOnly: false,
    operatingHours: {} as Record<string, { open: string; close: string; isClosed: boolean }>,
    organizationDescription: "",
    foundedYear: "",
    // Address
    street: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    // Social Links
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  });

  useEffect(() => {
    refreshUser();
  }, []);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        alternatePhone: user.alternatePhone || "",
        website: user.website || "",
        bio: user.bio || "",
        organizationName: user.organizationName || "",
        organizationType: user.organizationType || "restaurant",
        fssaiLicense: user.fssaiLicense || "",
        cuisineTypes: user.cuisineTypes || [],
        seatingCapacity: user.seatingCapacity?.toString() || "",
        dailySurplusCapacity: user.dailySurplusCapacity?.toString() || "",
        donationMode: user.donationMode || "pickup_only",
        isHalalCertified: user.isHalalCertified || false,
        isVegetarianOnly: user.isVegetarianOnly || false,
        operatingHours: user.operatingHours || {},
        organizationDescription: user.organizationDescription || "",
        foundedYear: user.foundedYear?.toString() || "",
        street: user.address?.street || "",
        area: user.address?.area || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        country: user.address?.country || "India",
        facebook: user.socialLinks?.facebook || "",
        instagram: user.socialLinks?.instagram || "",
        twitter: user.socialLinks?.twitter || "",
        linkedin: user.socialLinks?.linkedin || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm(p => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const toggleCuisine = (cuisine: string) => {
    setForm(p => ({
      ...p,
      cuisineTypes: p.cuisineTypes.includes(cuisine)
        ? p.cuisineTypes.filter(c => c !== cuisine)
        : [...p.cuisineTypes, cuisine]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        phoneNumber: form.phoneNumber || undefined,
        alternatePhone: form.alternatePhone || undefined,
        website: form.website || undefined,
        bio: form.bio || undefined,
        organizationName: form.organizationName,
        organizationType: form.organizationType,
        fssaiLicense: form.fssaiLicense || undefined,
        cuisineTypes: form.cuisineTypes.length ? form.cuisineTypes : undefined,
        seatingCapacity: form.seatingCapacity ? parseInt(form.seatingCapacity) : undefined,
        dailySurplusCapacity: form.dailySurplusCapacity ? parseInt(form.dailySurplusCapacity) : undefined,
        donationMode: form.donationMode,
        isHalalCertified: form.isHalalCertified,
        isVegetarianOnly: form.isVegetarianOnly,
        operatingHours: form.operatingHours,
        organizationDescription: form.organizationDescription || undefined,
        foundedYear: form.foundedYear ? parseInt(form.foundedYear) : undefined,
        address: {
          street: form.street,
          area: form.area,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        },
        socialLinks: {
          facebook: form.facebook || undefined,
          instagram: form.instagram || undefined,
          twitter: form.twitter || undefined,
          linkedin: form.linkedin || undefined,
        },
      };

      if (updateProfile) {
        await updateProfile(payload);
      }
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        alternatePhone: user.alternatePhone || "",
        website: user.website || "",
        bio: user.bio || "",
        organizationName: user.organizationName || "",
        organizationType: user.organizationType || "restaurant",
        fssaiLicense: user.fssaiLicense || "",
        cuisineTypes: user.cuisineTypes || [],
        seatingCapacity: user.seatingCapacity?.toString() || "",
        dailySurplusCapacity: user.dailySurplusCapacity?.toString() || "",
        donationMode: user.donationMode || "pickup_only",
        isHalalCertified: user.isHalalCertified || false,
        isVegetarianOnly: user.isVegetarianOnly || false,
        operatingHours: user.operatingHours || {},
        organizationDescription: user.organizationDescription || "",
        foundedYear: user.foundedYear?.toString() || "",
        street: user.address?.street || "",
        area: user.address?.area || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        country: user.address?.country || "India",
        facebook: user.socialLinks?.facebook || "",
        instagram: user.socialLinks?.instagram || "",
        twitter: user.socialLinks?.twitter || "",
        linkedin: user.socialLinks?.linkedin || "",
      });
    }
    setIsEditing(false);
  };

  const getTypeLabel = (value: string) => {
    return RESTAURANT_TYPES.find(t => t.value === value)?.label || value;
  };

  const getDonationModeLabel = (value: string) => {
    return DONATION_MODES.find(m => m.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/restaurant")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              Restaurant Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your restaurant information and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-green-500 hover:bg-green-600"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="gradient-primary text-white">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="glass-card p-6 bg-gradient-to-r from-primary/10 to-emerald-500/10 border-primary/20">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-28 w-28 rounded-2xl gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {form.organizationName?.charAt(0) || form.name?.charAt(0) || "R"}
                </div>
                {isEditing && (
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-background border-2 border-primary flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <Camera className="h-5 w-5 text-primary" />
                  </button>
                )}
                {user?.isVerified && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                )}
              </div>
              {user?.verificationStatus === "pending" && (
                <Badge variant="outline" className="mt-3 text-amber-500 border-amber-500/30">
                  <Clock className="h-3 w-3 mr-1" />
                  Verification Pending
                </Badge>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  {isEditing ? (
                    <Input
                      value={form.organizationName}
                      onChange={(e) => setForm(p => ({ ...p, organizationName: e.target.value }))}
                      className="text-2xl font-bold h-auto py-1 px-2 mb-2"
                      placeholder="Restaurant Name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-foreground">
                      {form.organizationName || "Your Restaurant"}
                    </h2>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="capitalize">
                      {getTypeLabel(form.organizationType)}
                    </Badge>
                    {form.cuisineTypes.slice(0, 3).map(cuisine => (
                      <Badge key={cuisine} className="bg-primary/10 text-primary border-primary/20">
                        {cuisine}
                      </Badge>
                    ))}
                    {form.cuisineTypes.length > 3 && (
                      <Badge variant="outline">+{form.cuisineTypes.length - 3} more</Badge>
                    )}
                  </div>
                  {form.city && (
                    <p className="text-muted-foreground mt-2 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {form.city}{form.state && `, ${form.state}`}
                    </p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-xl bg-background/50">
                    <Heart className="h-5 w-5 text-rose-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{MOCK_STATS.ngoPartnersConnected}</p>
                    <p className="text-xs text-muted-foreground">NGO Partners</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background/50">
                    <Package className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{MOCK_STATS.totalDonations}</p>
                    <p className="text-xs text-muted-foreground">Donations</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background/50">
                    <Utensils className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{MOCK_STATS.mealsServed}</p>
                    <p className="text-xs text-muted-foreground">Meals Served</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background/50">
                    <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{MOCK_STATS.co2Saved}</p>
                    <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {isEditing ? (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">About Your Restaurant</Label>
                  <Textarea
                    value={form.organizationDescription}
                    onChange={(e) => setForm(p => ({ ...p, organizationDescription: e.target.value }))}
                    placeholder="Tell NGOs about your restaurant, your food, and your mission..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              ) : form.organizationDescription ? (
                <p className="text-muted-foreground mt-4 line-clamp-2">{form.organizationDescription}</p>
              ) : null}
            </div>
          </div>
        </Card>
      </motion.div>

      <RoleBadges />

      {/* NGO Connections Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card p-4 bg-gradient-to-r from-primary/10 to-emerald-500/10 border-primary/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl  flex items-center justify-center">
                <Heart className="h-7 w-7 " />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">NGO Partnerships</h3>
                <p className="text-sm text-muted-foreground">
                  You're connected with <span className="font-bold ">{MOCK_STATS.ngoPartnersConnected} NGOs</span>
                  {MOCK_STATS.pendingConnections > 0 && (
                    <> • <span className="text-amber-500">{MOCK_STATS.pendingConnections} pending requests</span></>
                  )}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-black-500/30 hover:gradient-primary"
              onClick={() => navigate("/restaurant/connect-ngos")}
            >
              <Users className="h-4 w-4 mr-2" />
              View Partners
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* OVERVIEW TAB */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      {isEditing ? (
                        <Input
                          value={form.name}
                          onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{form.name || "—"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium text-foreground mt-1 flex items-center gap-2">
                        {form.email}
                        {user?.emailVerified && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          value={form.phoneNumber}
                          onChange={(e) => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                          className="mt-1"
                          placeholder="+91 9876543210"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{form.phoneNumber || "—"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Alternate Phone</Label>
                      {isEditing ? (
                        <Input
                          value={form.alternatePhone}
                          onChange={(e) => setForm(p => ({ ...p, alternatePhone: e.target.value }))}
                          className="mt-1"
                          placeholder="+91 9876543210"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{form.alternatePhone || "—"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Restaurant Info */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  Restaurant Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Business Type</Label>
                      {isEditing ? (
                        <Select
                          value={form.organizationType}
                          onValueChange={(v) => setForm(p => ({ ...p, organizationType: v }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RESTAURANT_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{getTypeLabel(form.organizationType)}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Year Established</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={form.foundedYear}
                          onChange={(e) => setForm(p => ({ ...p, foundedYear: e.target.value }))}
                          className="mt-1"
                          placeholder="2015"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{form.foundedYear || "—"}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">FSSAI License</Label>
                      {isEditing ? (
                        <Input
                          value={form.fssaiLicense}
                          onChange={(e) => setForm(p => ({ ...p, fssaiLicense: e.target.value }))}
                          className="mt-1"
                          placeholder="12345678901234"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1 flex items-center gap-2">
                          {form.fssaiLicense || "Not provided"}
                          {form.fssaiLicense && <Shield className="h-4 w-4 text-green-500" />}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Seating Capacity</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={form.seatingCapacity}
                          onChange={(e) => setForm(p => ({ ...p, seatingCapacity: e.target.value }))}
                          className="mt-1"
                          placeholder="80"
                        />
                      ) : (
                        <p className="font-medium text-foreground mt-1">
                          {form.seatingCapacity ? `${form.seatingCapacity} seats` : "—"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Cuisines */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Utensils className="h-5 w-5 text-primary" />
                Cuisine Types
              </h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {CUISINES.map(cuisine => (
                    <button
                      key={cuisine}
                      type="button"
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        form.cuisineTypes.includes(cuisine)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.cuisineTypes.length > 0 ? (
                    form.cuisineTypes.map(cuisine => (
                      <Badge key={cuisine} className="bg-primary/10 text-primary border-primary/20">
                        {cuisine}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No cuisines specified</p>
                  )}
                </div>
              )}
            </Card>

            {/* Certifications */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-primary" />
                Dietary Certifications
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  form.isHalalCertified 
                    ? "border-green-500/30 bg-green-500/10" 
                    : "border-border bg-muted/20"
                } ${isEditing ? "cursor-pointer hover:bg-muted/40" : ""}`}>
                  <input
                    type="checkbox"
                    name="isHalalCertified"
                    checked={form.isHalalCertified}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-primary w-5 h-5"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      ☪️ Halal Certified
                      {form.isHalalCertified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">Food prepared according to Islamic law</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  form.isVegetarianOnly 
                    ? "border-green-500/30 bg-green-500/10" 
                    : "border-border bg-muted/20"
                } ${isEditing ? "cursor-pointer hover:bg-muted/40" : ""}`}>
                  <input
                    type="checkbox"
                    name="isVegetarianOnly"
                    checked={form.isVegetarianOnly}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-primary w-5 h-5"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      🌱 Pure Vegetarian
                      {form.isVegetarianOnly && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">100% vegetarian kitchen</p>
                  </div>
                </label>
              </div>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* DETAILS TAB */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="details" className="mt-6 space-y-6">
            {/* Address */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                Address & Location
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Street / Building</Label>
                  {isEditing ? (
                    <Input
                      value={form.street}
                      onChange={(e) => setForm(p => ({ ...p, street: e.target.value }))}
                      className="mt-1"
                      placeholder="123, M.G. Road"
                    />
                  ) : (
                    <p className="font-medium text-foreground mt-1">{form.street || "—"}</p>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Area / Locality</Label>
                    {isEditing ? (
                      <Input
                        value={form.area}
                        onChange={(e) => setForm(p => ({ ...p, area: e.target.value }))}
                        className="mt-1"
                        placeholder="Koramangala"
                      />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.area || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    {isEditing ? (
                      <Input
                        value={form.city}
                        onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))}
                        className="mt-1"
                        placeholder="Bangalore"
                      />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.city || "—"}</p>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">State</Label>
                    {isEditing ? (
                      <Input
                        value={form.state}
                        onChange={(e) => setForm(p => ({ ...p, state: e.target.value }))}
                        className="mt-1"
                        placeholder="Karnataka"
                      />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.state || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">PIN Code</Label>
                    {isEditing ? (
                      <Input
                        value={form.zipCode}
                        onChange={(e) => setForm(p => ({ ...p, zipCode: e.target.value }))}
                        className="mt-1"
                        placeholder="560034"
                      />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.zipCode || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    {isEditing ? (
                      <Input
                        value={form.country}
                        onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))}
                        className="mt-1"
                        placeholder="India"
                      />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.country || "India"}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Donation Settings */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-primary" />
                Donation Preferences
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Donation Mode</Label>
                  {isEditing ? (
                    <div className="grid sm:grid-cols-3 gap-3 mt-2">
                      {DONATION_MODES.map(m => (
                        <button
                          key={m.value}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, donationMode: m.value }))}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            form.donationMode === m.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="font-semibold text-sm">{m.label}</div>
                          <div className="text-xs text-muted-foreground">{m.desc}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="font-medium text-foreground mt-1">{getDonationModeLabel(form.donationMode)}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Daily Surplus Capacity</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={form.dailySurplusCapacity}
                      onChange={(e) => setForm(p => ({ ...p, dailySurplusCapacity: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g., 50 meals/kg per day"
                    />
                  ) : (
                    <p className="font-medium text-foreground mt-1">
                      {form.dailySurplusCapacity ? `${form.dailySurplusCapacity} meals/kg per day` : "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* OPERATIONS TAB */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="operations" className="mt-6 space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                Operating Hours
              </h3>
              <div className="space-y-3">
                {DAYS.map(day => {
                  const hours = form.operatingHours[day] || { open: "09:00", close: "22:00", isClosed: false };
                  return (
                    <div key={day} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="w-24 font-medium capitalize text-foreground">{day}</div>
                      {isEditing ? (
                        <>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={hours.isClosed}
                              onChange={(e) => {
                                setForm(p => ({
                                  ...p,
                                  operatingHours: {
                                    ...p.operatingHours,
                                    [day]: { ...hours, isClosed: e.target.checked }
                                  }
                                }));
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-muted-foreground">Closed</span>
                          </label>
                          {!hours.isClosed && (
                            <>
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) => {
                                  setForm(p => ({
                                    ...p,
                                    operatingHours: {
                                      ...p.operatingHours,
                                      [day]: { ...hours, open: e.target.value }
                                    }
                                  }));
                                }}
                                className="w-28"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) => {
                                  setForm(p => ({
                                    ...p,
                                    operatingHours: {
                                      ...p.operatingHours,
                                      [day]: { ...hours, close: e.target.value }
                                    }
                                  }));
                                }}
                                className="w-28"
                              />
                            </>
                          )}
                        </>
                      ) : (
                        <div className="flex-1">
                          {hours.isClosed ? (
                            <Badge variant="outline" className="text-red-500 border-red-500/30">Closed</Badge>
                          ) : (
                            <span className="text-foreground">{hours.open} - {hours.close}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════════ */}
          {/* CONTACT TAB */}
          {/* ══════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="contact" className="mt-6 space-y-6">
            {/* Website */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                Website
              </h3>
              {isEditing ? (
                <Input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))}
                  placeholder="https://www.yourrestaurant.com"
                />
              ) : form.website ? (
                <a
                  href={form.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  {form.website}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <p className="text-muted-foreground">No website added</p>
              )}
            </Card>

            {/* Social Links */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-primary" />
                Social Media
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                  </Label>
                  {isEditing ? (
                    <Input
                      value={form.facebook}
                      onChange={(e) => setForm(p => ({ ...p, facebook: e.target.value }))}
                      className="mt-1"
                      placeholder="https://facebook.com/yourpage"
                    />
                  ) : (
                    <p className="font-medium text-foreground mt-1">
                      {form.facebook ? (
                        <a href={form.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {form.facebook}
                        </a>
                      ) : "—"}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-600" /> Instagram
                  </Label>
                  {isEditing ? (
                    <Input
                      value={form.instagram}
                      onChange={(e) => setForm(p => ({ ...p, instagram: e.target.value }))}
                      className="mt-1"
                      placeholder="https://instagram.com/yourpage"
                    />
                  ) : (
                    <p className="font-medium text-foreground mt-1">
                      {form.instagram ? (
                        <a href={form.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {form.instagram}
                        </a>
                      ) : "—"}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-sky-500" /> Twitter
                  </Label>
                  {isEditing ? (
                    <Input
                      value={form.twitter}
                      onChange={(e) => setForm(p => ({ ...p, twitter: e.target.value }))}
                      className="mt-1"
                      placeholder="https://twitter.com/yourhandle"
                    />
                  ) : (
                    <p className="font-medium text-foreground mt-1">
                      {form.twitter ? (
                        <a href={form.twitter} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {form.twitter}
                        </a>
                      ) : "—"}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
                  </Label>
                  {isEditing ? (
                    <Input
                      value={form.linkedin}
                      onChange={(e) => setForm(p => ({ ...p, linkedin: e.target.value }))}
                      className="mt-1"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  ) : (
                    <p className="font-medium text-foreground mt-1">
                      {form.linkedin ? (
                        <a href={form.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {form.linkedin}
                        </a>
                      ) : "—"}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Account Info */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <p className="font-medium text-foreground">Active</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm text-muted-foreground">Email Verification</p>
                    <p className="font-medium text-foreground">{form.email}</p>
                  </div>
                  {user?.emailVerified ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium text-foreground">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "—"}
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Avatar Upload Modal */}
      <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="h-32 w-32 rounded-2xl gradient-primary flex items-center justify-center text-white text-5xl font-bold">
              {form.organizationName?.charAt(0) || form.name?.charAt(0) || "R"}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Profile photo upload coming soon!<br />
              For now, your initials will be displayed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvatarModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
