// src/pages/ngo/NGOProfile.tsx
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
  Hash,
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
  Thermometer,
  Target,
  Leaf,
  HandHeart,
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
import { toast } from "sonner";

// ── Constants ─────────────────────────────────────────────────────────────────
const NGO_TYPES = [
  { value: "orphanage", label: "Orphanage" },
  { value: "old_age_home", label: "Old Age Home" },
  { value: "shelter", label: "Shelter Home" },
  { value: "food_bank", label: "Food Bank" },
  { value: "community_kitchen", label: "Community Kitchen" },
  { value: "educational_trust", label: "Educational Trust" },
  { value: "hospital", label: "Hospital / Clinic" },
  { value: "rehabilitation", label: "Rehabilitation Centre" },
  { value: "animal_shelter", label: "Animal Shelter" },
  { value: "other", label: "Other" },
];

const BENEFICIARY_OPTIONS = [
  { value: "children", label: "Children", icon: "👧" },
  { value: "elderly", label: "Elderly", icon: "👴" },
  { value: "homeless", label: "Homeless", icon: "🏠" },
  { value: "disabled", label: "Differently Abled", icon: "♿" },
  { value: "refugees", label: "Refugees", icon: "🌍" },
  { value: "animals", label: "Animals", icon: "🐾" },
  { value: "general_public", label: "General Public", icon: "👥" },
];

const NGO_TYPE_ICONS: Record<string, string> = {
  orphanage: "🏠",
  old_age_home: "👴",
  shelter: "🛖",
  food_bank: "🏦",
  community_kitchen: "🍳",
  educational_trust: "📚",
  hospital: "🏥",
  rehabilitation: "💪",
  animal_shelter: "🐾",
  other: "🤝",
};

// ── Mock Stats ────────────────────────────────────────────────────────────────
const MOCK_STATS = {
  totalMealsCollected: 1248,
  restaurantPartners: 18,
  beneficiariesServed: 3200,
  pendingConnections: 5,
  co2Saved: "186 kg",
  totalPickups: 324,
};

export default function NGOProfile() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    alternatePhone: "",
    website: "",
    bio: "",
    organizationName: "",
    ngoType: "",
    ngoRegistrationNumber: "",
    beneficiaryTypes: [] as string[],
    dailyBeneficiaries: "",
    totalBeneficiaries: "",
    hasPickupVehicle: false,
    pickupRadius: "",
    hasRefrigeration: false,
    storageCapacityKg: "",
    preferredFoodTypes: "",
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
        ngoType: user.ngoType || "",
        ngoRegistrationNumber: user.ngoRegistrationNumber || "",
        beneficiaryTypes: user.beneficiaryTypes || [],
        dailyBeneficiaries: user.dailyBeneficiaries?.toString() || "",
        totalBeneficiaries: user.totalBeneficiaries?.toString() || "",
        hasPickupVehicle: user.hasPickupVehicle || false,
        pickupRadius: user.pickupRadius?.toString() || "",
        hasRefrigeration: user.hasRefrigeration || false,
        storageCapacityKg: user.storageCapacityKg?.toString() || "",
        preferredFoodTypes: user.preferredFoodTypes?.join(", ") || "",
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

  const toggleBeneficiary = (value: string) => {
    setForm(p => ({
      ...p,
      beneficiaryTypes: p.beneficiaryTypes.includes(value)
        ? p.beneficiaryTypes.filter(b => b !== value)
        : [...p.beneficiaryTypes, value],
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
        organizationType: "ngo",
        ngoType: form.ngoType,
        ngoRegistrationNumber: form.ngoRegistrationNumber || undefined,
        beneficiaryTypes: form.beneficiaryTypes.length ? form.beneficiaryTypes : undefined,
        dailyBeneficiaries: form.dailyBeneficiaries ? parseInt(form.dailyBeneficiaries) : undefined,
        totalBeneficiaries: form.totalBeneficiaries ? parseInt(form.totalBeneficiaries) : undefined,
        hasPickupVehicle: form.hasPickupVehicle,
        pickupRadius: form.pickupRadius ? parseInt(form.pickupRadius) : undefined,
        hasRefrigeration: form.hasRefrigeration,
        storageCapacityKg: form.storageCapacityKg ? parseInt(form.storageCapacityKg) : undefined,
        preferredFoodTypes: form.preferredFoodTypes
          ? form.preferredFoodTypes.split(",").map(s => s.trim()).filter(Boolean)
          : undefined,
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
        ngoType: user.ngoType || "",
        ngoRegistrationNumber: user.ngoRegistrationNumber || "",
        beneficiaryTypes: user.beneficiaryTypes || [],
        dailyBeneficiaries: user.dailyBeneficiaries?.toString() || "",
        totalBeneficiaries: user.totalBeneficiaries?.toString() || "",
        hasPickupVehicle: user.hasPickupVehicle || false,
        pickupRadius: user.pickupRadius?.toString() || "",
        hasRefrigeration: user.hasRefrigeration || false,
        storageCapacityKg: user.storageCapacityKg?.toString() || "",
        preferredFoodTypes: user.preferredFoodTypes?.join(", ") || "",
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

  const getNgoTypeLabel = (value: string) =>
    NGO_TYPES.find(t => t.value === value)?.label || value;

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <HandHeart className="h-8 w-8 text-primary" />
              NGO Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization information and capabilities
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
              <Button onClick={handleSave} disabled={saving} className="bg-green-500 hover:bg-green-600">
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

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* PROFILE HEADER CARD */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
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
                  {form.ngoType ? NGO_TYPE_ICONS[form.ngoType] || "🤝" : form.organizationName?.charAt(0) || "N"}
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

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  {isEditing ? (
                    <Input
                      value={form.organizationName}
                      onChange={(e) => setForm(p => ({ ...p, organizationName: e.target.value }))}
                      className="text-2xl font-bold h-auto py-1 px-2 mb-2"
                      placeholder="Organization Name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-foreground">
                      {form.organizationName || "Your Organization"}
                    </h2>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="capitalize">
                      {getNgoTypeLabel(form.ngoType)}
                    </Badge>
                    {form.beneficiaryTypes.slice(0, 3).map(b => {
                      const opt = BENEFICIARY_OPTIONS.find(o => o.value === b);
                      return (
                        <Badge key={b} className="bg-primary/10 text-primary border-primary/20">
                          {opt?.icon} {opt?.label || b}
                        </Badge>
                      );
                    })}
                    {form.beneficiaryTypes.length > 3 && (
                      <Badge variant="outline">+{form.beneficiaryTypes.length - 3} more</Badge>
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
                    <Building2 className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{MOCK_STATS.restaurantPartners}</p>
                    <p className="text-xs text-muted-foreground">Partners</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background/50">
                    <Utensils className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{MOCK_STATS.totalMealsCollected}</p>
                    <p className="text-xs text-muted-foreground">Meals</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background/50">
                    <Users className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{MOCK_STATS.beneficiariesServed}</p>
                    <p className="text-xs text-muted-foreground">Served</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-background/50">
                    <Leaf className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-foreground">{MOCK_STATS.co2Saved}</p>
                    <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {isEditing ? (
                <div className="mt-4">
                  <Label className="text-sm text-muted-foreground">About Your Organization</Label>
                  <Textarea
                    value={form.organizationDescription}
                    onChange={(e) => setForm(p => ({ ...p, organizationDescription: e.target.value }))}
                    placeholder="Tell restaurants about your NGO, the people you serve, and your mission..."
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

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* RESTAURANT PARTNERS BANNER */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card p-4 border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-indigo-500/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Building2 className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Restaurant Partnerships</h3>
                <p className="text-sm text-muted-foreground">
                  You're connected with <span className="font-bold text-blue-500">{MOCK_STATS.restaurantPartners} restaurants</span>
                  {MOCK_STATS.pendingConnections > 0 && (
                    <> • <span className="text-amber-500">{MOCK_STATS.pendingConnections} pending requests</span></>
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
            >
              <Heart className="h-4 w-4 mr-2" />
              View Partners
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TABS */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* OVERVIEW TAB */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary" />
                  Contact Person
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      {isEditing ? (
                        <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="mt-1" />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{form.name || "—"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium text-foreground mt-1 flex items-center gap-2">
                        {form.email}
                        {user?.emailVerified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone Number</Label>
                      {isEditing ? (
                        <Input value={form.phoneNumber} onChange={(e) => setForm(p => ({ ...p, phoneNumber: e.target.value }))} className="mt-1" placeholder="+91 9876543210" />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{form.phoneNumber || "—"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Alternate Phone</Label>
                      {isEditing ? (
                        <Input value={form.alternatePhone} onChange={(e) => setForm(p => ({ ...p, alternatePhone: e.target.value }))} className="mt-1" placeholder="+91 9876543210" />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{form.alternatePhone || "—"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Organization Info */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  Organization Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Organization Type</Label>
                      {isEditing ? (
                        <Select value={form.ngoType} onValueChange={(v) => setForm(p => ({ ...p, ngoType: v }))}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {NGO_TYPES.map(t => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-foreground mt-1">{getNgoTypeLabel(form.ngoType)}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Year Established</Label>
                      {isEditing ? (
                        <Input type="number" value={form.foundedYear} onChange={(e) => setForm(p => ({ ...p, foundedYear: e.target.value }))} className="mt-1" placeholder="2015" />
                      ) : (
                        <p className="font-medium text-foreground mt-1">{form.foundedYear || "—"}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Registration Number</Label>
                      {isEditing ? (
                        <Input value={form.ngoRegistrationNumber} onChange={(e) => setForm(p => ({ ...p, ngoRegistrationNumber: e.target.value }))} className="mt-1" placeholder="NGO/2015/IND/0001" />
                      ) : (
                        <p className="font-medium text-foreground mt-1 flex items-center gap-2">
                          {form.ngoRegistrationNumber || "Not provided"}
                          {form.ngoRegistrationNumber && <Shield className="h-4 w-4 text-green-500" />}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Daily Meals Served</Label>
                      {isEditing ? (
                        <Input type="number" value={form.dailyBeneficiaries} onChange={(e) => setForm(p => ({ ...p, dailyBeneficiaries: e.target.value }))} className="mt-1" placeholder="200" />
                      ) : (
                        <p className="font-medium text-foreground mt-1">
                          {form.dailyBeneficiaries ? `${form.dailyBeneficiaries} meals/day` : "—"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Beneficiary Types */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-primary" />
                Who We Serve
              </h3>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {BENEFICIARY_OPTIONS.map(b => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => toggleBeneficiary(b.value)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                        form.beneficiaryTypes.includes(b.value)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {b.icon} {b.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.beneficiaryTypes.length > 0 ? (
                    form.beneficiaryTypes.map(b => {
                      const opt = BENEFICIARY_OPTIONS.find(o => o.value === b);
                      return (
                        <Badge key={b} className="bg-primary/10 text-primary border-primary/20 py-1.5">
                          {opt?.icon} {opt?.label || b}
                        </Badge>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground">No beneficiary types specified</p>
                  )}
                </div>
              )}
            </Card>

            {/* Preferred Food Types */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Utensils className="h-5 w-5 text-primary" />
                Preferred Food Types
              </h3>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={form.preferredFoodTypes}
                    onChange={(e) => setForm(p => ({ ...p, preferredFoodTypes: e.target.value }))}
                    placeholder="e.g., Cooked meals, Vegetables, Dairy (comma-separated)"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.preferredFoodTypes ? (
                    form.preferredFoodTypes.split(",").map((type, i) => (
                      <Badge key={i} variant="outline" className="py-1.5">
                        {type.trim()}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No preferences specified — we accept all food types</p>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* CAPACITY TAB */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="capacity" className="mt-6 space-y-6">
            {/* Beneficiaries */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                Beneficiary Capacity
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Meals Served Per Day</Label>
                  {isEditing ? (
                    <Input type="number" value={form.dailyBeneficiaries} onChange={(e) => setForm(p => ({ ...p, dailyBeneficiaries: e.target.value }))} className="mt-1" placeholder="200" />
                  ) : (
                    <p className="font-medium text-foreground mt-1 text-2xl">
                      {form.dailyBeneficiaries || "—"}
                      {form.dailyBeneficiaries && <span className="text-sm text-muted-foreground font-normal ml-1">meals/day</span>}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Beneficiaries</Label>
                  {isEditing ? (
                    <Input type="number" value={form.totalBeneficiaries} onChange={(e) => setForm(p => ({ ...p, totalBeneficiaries: e.target.value }))} className="mt-1" placeholder="500" />
                  ) : (
                    <p className="font-medium text-foreground mt-1 text-2xl">
                      {form.totalBeneficiaries || "—"}
                      {form.totalBeneficiaries && <span className="text-sm text-muted-foreground font-normal ml-1">people</span>}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Pickup Capability */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-primary" />
                Pickup Capability
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  form.hasPickupVehicle
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-border bg-muted/20"
                } ${isEditing ? "cursor-pointer hover:bg-muted/40" : ""}`}>
                  <input
                    type="checkbox"
                    name="hasPickupVehicle"
                    checked={form.hasPickupVehicle}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-primary w-5 h-5"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      🚐 Has Pickup Vehicle
                      {form.hasPickupVehicle && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">We can collect food ourselves</p>
                  </div>
                </label>
                <div>
                  <Label className="text-xs text-muted-foreground">Pickup Radius (km)</Label>
                  {isEditing ? (
                    <Input type="number" value={form.pickupRadius} onChange={(e) => setForm(p => ({ ...p, pickupRadius: e.target.value }))} className="mt-1" placeholder="e.g., 10" />
                  ) : (
                    <p className="font-medium text-foreground mt-1">
                      {form.pickupRadius ? `${form.pickupRadius} km` : "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Storage */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Thermometer className="h-5 w-5 text-primary" />
                Storage Capability
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  form.hasRefrigeration
                    ? "border-cyan-500/30 bg-cyan-500/10"
                    : "border-border bg-muted/20"
                } ${isEditing ? "cursor-pointer hover:bg-muted/40" : ""}`}>
                  <input
                    type="checkbox"
                    name="hasRefrigeration"
                    checked={form.hasRefrigeration}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-primary w-5 h-5"
                  />
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      ❄️ Refrigeration Available
                      {form.hasRefrigeration && <CheckCircle2 className="h-4 w-4 text-cyan-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">Can store perishable items</p>
                  </div>
                </label>
                <div>
                  <Label className="text-xs text-muted-foreground">Storage Capacity (kg)</Label>
                  {isEditing ? (
                    <Input type="number" value={form.storageCapacityKg} onChange={(e) => setForm(p => ({ ...p, storageCapacityKg: e.target.value }))} className="mt-1" placeholder="e.g., 100" />
                  ) : (
                    <p className="font-medium text-foreground mt-1">
                      {form.storageCapacityKg ? `${form.storageCapacityKg} kg` : "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Capability Summary */}
            {!isEditing && (
              <Card className="glass-card p-6 bg-gradient-to-r from-primary/5 to-emerald-500/5 border-primary/20">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-primary" />
                  Capability Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl bg-background/50">
                    <Utensils className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{form.dailyBeneficiaries || "—"}</p>
                    <p className="text-xs text-muted-foreground">Meals / Day</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-background/50">
                    <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{form.totalBeneficiaries || "—"}</p>
                    <p className="text-xs text-muted-foreground">Beneficiaries</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-background/50">
                    <MapPin className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{form.pickupRadius || "—"}</p>
                    <p className="text-xs text-muted-foreground">km Radius</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-background/50">
                    <Package className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{form.storageCapacityKg || "—"}</p>
                    <p className="text-xs text-muted-foreground">kg Storage</p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* ADDRESS TAB */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="address" className="mt-6 space-y-6">
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                Address & Location
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Street / Building</Label>
                  {isEditing ? (
                    <Input value={form.street} onChange={(e) => setForm(p => ({ ...p, street: e.target.value }))} className="mt-1" placeholder="123, M.G. Road" />
                  ) : (
                    <p className="font-medium text-foreground mt-1">{form.street || "—"}</p>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Area / Locality</Label>
                    {isEditing ? (
                      <Input value={form.area} onChange={(e) => setForm(p => ({ ...p, area: e.target.value }))} className="mt-1" placeholder="Koramangala" />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.area || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    {isEditing ? (
                      <Input value={form.city} onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))} className="mt-1" placeholder="Bangalore" />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.city || "—"}</p>
                    )}
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">State</Label>
                    {isEditing ? (
                      <Input value={form.state} onChange={(e) => setForm(p => ({ ...p, state: e.target.value }))} className="mt-1" placeholder="Karnataka" />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.state || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">PIN Code</Label>
                    {isEditing ? (
                      <Input value={form.zipCode} onChange={(e) => setForm(p => ({ ...p, zipCode: e.target.value }))} className="mt-1" placeholder="560034" />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.zipCode || "—"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    {isEditing ? (
                      <Input value={form.country} onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))} className="mt-1" placeholder="India" />
                    ) : (
                      <p className="font-medium text-foreground mt-1">{form.country || "India"}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* CONTACT TAB */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="contact" className="mt-6 space-y-6">
            {/* Website */}
            <Card className="glass-card p-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                Website
              </h3>
              {isEditing ? (
                <Input type="url" value={form.website} onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://www.yourorganization.org" />
              ) : form.website ? (
                <a href={form.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
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
                {[
                  { key: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600" },
                  { key: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-600" },
                  { key: "twitter", label: "Twitter", icon: Twitter, color: "text-sky-500" },
                  { key: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
                ].map(social => (
                  <div key={social.key}>
                    <Label className="text-xs text-muted-foreground flex items-center gap-2">
                      <social.icon className={`h-4 w-4 ${social.color}`} /> {social.label}
                    </Label>
                    {isEditing ? (
                      <Input
                        value={(form as any)[social.key]}
                        onChange={(e) => setForm(p => ({ ...p, [social.key]: e.target.value }))}
                        className="mt-1"
                        placeholder={`https://${social.key}.com/yourpage`}
                      />
                    ) : (
                      <p className="font-medium text-foreground mt-1">
                        {(form as any)[social.key] ? (
                          <a href={(form as any)[social.key]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {(form as any)[social.key]}
                          </a>
                        ) : "—"}
                      </p>
                    )}
                  </div>
                ))}
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
                    <p className="text-sm text-muted-foreground">NGO Verification</p>
                    <p className="font-medium text-foreground capitalize">{user?.verificationStatus || "pending"}</p>
                  </div>
                  {user?.isVerified ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                      <Clock className="h-3 w-3 mr-1" />
                      {user?.verificationStatus || "Pending"}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium text-foreground">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric', month: 'long', day: 'numeric'
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
              {form.ngoType ? NGO_TYPE_ICONS[form.ngoType] || "🤝" : form.organizationName?.charAt(0) || "N"}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Profile photo upload coming soon!<br />
              For now, your organization icon will be displayed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvatarModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}