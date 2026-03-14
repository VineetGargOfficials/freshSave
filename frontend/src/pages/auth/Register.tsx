import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus, Mail, Lock, User, Phone, Building, Loader2,
  Eye, EyeOff, MapPin, Globe, ChevronRight, ChevronLeft,
  Utensils, Heart, CheckCircle2, FileText, Clock, Truck,
  Thermometer, Users, Star, Hash, Calendar, LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLE_OPTIONS = [
  { value: "user", label: "Individual User", icon: "👤", desc: "Track your food, reduce waste" },
  { value: "restaurant", label: "Restaurant / Caterer", icon: "🍽️", desc: "List surplus food for donation" },
  { value: "ngo", label: "NGO / Organization", icon: "🤝", desc: "Receive surplus food donations" },
];

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

const CUISINES = [
  "Indian", "Chinese", "Italian", "Mexican", "Continental", "Fast Food",
  "South Indian", "North Indian", "Mughlai", "Seafood", "Vegan", "Bakery", "Multi-Cuisine", "Other"
];

const BENEFICIARY_TYPES = [
  { value: "children", label: "Children", icon: "👧" },
  { value: "elderly", label: "Elderly", icon: "👴" },
  { value: "homeless", label: "Homeless", icon: "🏠" },
  { value: "disabled", label: "Differently Abled", icon: "♿" },
  { value: "refugees", label: "Refugees", icon: "🌍" },
  { value: "animals", label: "Animals", icon: "🐾" },
  { value: "general_public", label: "General Public", icon: "👥" },
];

const DONATION_MODES = [
  { value: "pickup_only", label: "Pickup Only", desc: "NGO comes to collect" },
  { value: "delivery", label: "Delivery", desc: "We deliver to NGO" },
  { value: "both", label: "Both", desc: "Either way works" },
];

// ══════════════════════════════════════════════════════════════════════════════
// FIX: Move Field component OUTSIDE the Register component
// ══════════════════════════════════════════════════════════════════════════════
interface FieldProps {
  id: string;
  label: string;
  icon?: LucideIcon;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}

const Field = ({ id, label, icon: Icon, type = "text", placeholder, required = false, value, onChange, ...rest }: FieldProps) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      {label}{required && <span className="text-red-500">*</span>}
    </Label>
    <Input 
      id={id} 
      name={id} 
      type={type} 
      placeholder={placeholder}
      value={value} 
      onChange={onChange} 
      {...rest} 
    />
  </div>
);

// ── Initial form state ────────────────────────────────────────────────────────
interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  alternatePhone: string;
  website: string;
  bio: string;
  role: string;
  street: string;
  area: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  organizationName: string;
  organizationType: string;
  fssaiLicense: string;
  cuisineTypes: string[];
  seatingCapacity: string;
  dailySurplusCapacity: string;
  donationMode: string;
  isHalalCertified: boolean;
  isVegetarianOnly: boolean;
  openTime: string;
  closeTime: string;
  ngoRegistrationNumber: string;
  ngoType: string;
  beneficiaryTypes: string[];
  dailyBeneficiaries: string;
  totalBeneficiaries: string;
  hasPickupVehicle: boolean;
  pickupRadius: string;
  hasRefrigeration: boolean;
  storageCapacityKg: string;
  preferredFoodTypes: string;
  organizationDescription: string;
  foundedYear: string;
}

const initialForm: FormState = {
  name: "", email: "", password: "", confirmPassword: "",
  phoneNumber: "", alternatePhone: "", website: "", bio: "",
  role: "user",
  street: "", area: "", city: "", state: "", zipCode: "", country: "India",
  organizationName: "", organizationType: "",
  fssaiLicense: "", cuisineTypes: [],
  seatingCapacity: "", dailySurplusCapacity: "",
  donationMode: "pickup_only",
  isHalalCertified: false, isVegetarianOnly: false,
  openTime: "09:00", closeTime: "22:00",
  ngoRegistrationNumber: "", ngoType: "",
  beneficiaryTypes: [],
  dailyBeneficiaries: "", totalBeneficiaries: "",
  hasPickupVehicle: false, pickupRadius: "",
  hasRefrigeration: false, storageCapacityKg: "",
  preferredFoodTypes: "",
  organizationDescription: "", foundedYear: "",
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const isOrg = form.role === "restaurant" || form.role === "ngo";
  const totalSteps = form.role === "user" ? 1 : 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm(p => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(p => ({ ...p, [name]: value }));
    }
  };

  const toggleListItem = (field: "cuisineTypes" | "beneficiaryTypes", val: string) => {
    setForm(p => {
      const arr = p[field];
      return { ...p, [field]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.name || !form.email || !form.password) {
        toast.error("Please fill in all required fields");
        return false;
      }
      if (form.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return false;
      }
      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    if (step === 2 && isOrg) {
      if (!form.organizationName) {
        toast.error("Organization name is required");
        return false;
      }
      if (!form.city) {
        toast.error("City is required");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phoneNumber: form.phoneNumber || undefined,
        alternatePhone: form.alternatePhone || undefined,
        website: form.website || undefined,
        bio: form.bio || undefined,
      };

      if (form.city || form.street) {
        payload.address = {
          street: form.street,
          area: form.area,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        };
      }

      if (form.role === "restaurant") {
        Object.assign(payload, {
          organizationName: form.organizationName,
          organizationType: form.organizationType || "restaurant",
          fssaiLicense: form.fssaiLicense || undefined,
          cuisineTypes: form.cuisineTypes.length ? form.cuisineTypes : undefined,
          seatingCapacity: form.seatingCapacity ? parseInt(form.seatingCapacity) : undefined,
          dailySurplusCapacity: form.dailySurplusCapacity ? parseInt(form.dailySurplusCapacity) : undefined,
          donationMode: form.donationMode,
          isHalalCertified: form.isHalalCertified,
          isVegetarianOnly: form.isVegetarianOnly,
          organizationDescription: form.organizationDescription || undefined,
          foundedYear: form.foundedYear ? parseInt(form.foundedYear) : undefined,
          operatingHours: Object.fromEntries(
            ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(d => [
              d, { open: form.openTime, close: form.closeTime, isClosed: false }
            ])
          ),
        });
      }

      if (form.role === "ngo") {
        Object.assign(payload, {
          organizationName: form.organizationName,
          organizationType: "ngo",
          ngoRegistrationNumber: form.ngoRegistrationNumber || undefined,
          ngoType: form.ngoType || undefined,
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
        });
      }

      await register(payload);
      toast.success("Account created! Please verify your email before logging in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-full gradient-primary mb-4">
            <span className="text-3xl">🥗</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Join FreshSave</h1>
          <p className="text-muted-foreground text-sm">Start reducing food waste today</p>
        </div>

        {/* Step indicator */}
        {isOrg && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > i + 1 ? "bg-green-500 text-white" :
                  step === i + 1 ? "gradient-primary text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`h-0.5 w-12 transition-all ${step > i + 1 ? "bg-green-500" : "bg-muted"}`} />
                )}
              </div>
            ))}
            <span className="ml-3 text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
        )}

        <Card className="glass-card p-8">
          <form onSubmit={step === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Basic Info ──────────────────────────────────── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-orange-500" /> Your Information
                  </h2>

                  {/* Role selector */}
                  <div className="space-y-2">
                    <Label className="font-medium">Account Type <span className="text-red-500">*</span></Label>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {ROLE_OPTIONS.map(r => (
                        <button key={r.value} type="button"
                          onClick={() => { setForm(p => ({ ...p, role: r.value })); setStep(1); }}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            form.role === r.value
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-border hover:border-orange-500/50 hover:bg-muted/50"
                          }`}>
                          <div className="text-2xl mb-1">{r.icon}</div>
                          <div className="font-semibold text-sm text-foreground">{r.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{r.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field 
                      id="name" 
                      label="Full Name" 
                      icon={User} 
                      placeholder="John Doe" 
                      required 
                      value={form.name}
                      onChange={handleChange}
                    />
                    <Field 
                      id="phoneNumber" 
                      label="Phone Number" 
                      icon={Phone} 
                      placeholder="+91 9876543210" 
                      type="tel"
                      value={form.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <Field 
                    id="email" 
                    label="Email Address" 
                    icon={Mail} 
                    placeholder="you@example.com" 
                    type="email" 
                    required
                    value={form.email}
                    onChange={handleChange}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          name="password" 
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 6 characters" 
                          value={form.password} 
                          onChange={handleChange} 
                          required 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        Confirm Password <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type="password"
                        placeholder="Re-enter password" 
                        value={form.confirmPassword} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                  </div>

                  {form.role === "user" && (
                    <Field 
                      id="city" 
                      label="City" 
                      icon={MapPin} 
                      placeholder="Mumbai"
                      value={form.city}
                      onChange={handleChange}
                    />
                  )}
                </motion.div>
              )}

              {/* ── STEP 2: Organization & Location ─────────────────────── */}
              {step === 2 && isOrg && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Building className="h-5 w-5 text-orange-500" /> Organization Details
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field 
                      id="organizationName" 
                      label="Organization Name" 
                      icon={Building}
                      placeholder={form.role === "restaurant" ? "Spice Garden Restaurant" : "Hope Foundation"} 
                      required
                      value={form.organizationName}
                      onChange={handleChange}
                    />
                    <div className="space-y-2">
                      <Label className="font-medium">
                        {form.role === "restaurant" ? "Business Type" : "Organization Type"} <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={form.role === "restaurant" ? form.organizationType : form.ngoType}
                        onValueChange={v => {
                          if (form.role === "restaurant") {
                            setForm(p => ({ ...p, organizationType: v }));
                          } else {
                            setForm(p => ({ ...p, ngoType: v }));
                          }
                        }}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          {(form.role === "restaurant" ? RESTAURANT_TYPES : NGO_TYPES).map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-3">
                    <Label className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> Address
                    </Label>
                    <Field 
                      id="street" 
                      label="Street / Building" 
                      placeholder="123, M.G. Road"
                      value={form.street}
                      onChange={handleChange}
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field 
                        id="area" 
                        label="Area / Locality" 
                        placeholder="Koramangala"
                        value={form.area}
                        onChange={handleChange}
                      />
                      <Field 
                        id="city" 
                        label="City" 
                        placeholder="Bangalore" 
                        required
                        value={form.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field 
                        id="state" 
                        label="State" 
                        placeholder="Karnataka"
                        value={form.state}
                        onChange={handleChange}
                      />
                      <Field 
                        id="zipCode" 
                        label="PIN Code" 
                        placeholder="560034"
                        value={form.zipCode}
                        onChange={handleChange}
                      />
                      <Field 
                        id="country" 
                        label="Country" 
                        placeholder="India"
                        value={form.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Phone / Website */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field 
                      id="alternatePhone" 
                      label="Alternate Phone" 
                      icon={Phone} 
                      placeholder="+91 9876543210"
                      value={form.alternatePhone}
                      onChange={handleChange}
                    />
                    <Field 
                      id="website" 
                      label="Website" 
                      icon={Globe} 
                      placeholder="https://example.com" 
                      type="url"
                      value={form.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field 
                      id="foundedYear" 
                      label="Year Established" 
                      icon={Calendar} 
                      placeholder="2015" 
                      type="number"
                      value={form.foundedYear}
                      onChange={handleChange}
                    />
                    {form.role === "restaurant"
                      ? <Field 
                          id="fssaiLicense" 
                          label="FSSAI License No." 
                          icon={FileText} 
                          placeholder="12345678901234"
                          value={form.fssaiLicense}
                          onChange={handleChange}
                        />
                      : <Field 
                          id="ngoRegistrationNumber" 
                          label="NGO Reg. Number" 
                          icon={Hash} 
                          placeholder="NGO/2015/IND/0001"
                          value={form.ngoRegistrationNumber}
                          onChange={handleChange}
                        />
                    }
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-medium">
                      <FileText className="h-4 w-4 text-muted-foreground" /> Brief Description
                    </Label>
                    <Textarea 
                      id="organizationDescription" 
                      name="organizationDescription"
                      value={form.organizationDescription} 
                      onChange={handleChange} 
                      rows={2}
                      placeholder={form.role === "restaurant"
                        ? "Tell donors about your restaurant and your surplus food..."
                        : "Tell restaurants about your organization and the people you serve..."} 
                    />
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Role-specific Details ────────────────────────── */}
              {step === 3 && isOrg && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} className="space-y-6">

                  {/* RESTAURANT step 3 */}
                  {form.role === "restaurant" && (
                    <>
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-orange-500" /> Food & Operations
                      </h2>

                      <div className="space-y-2">
                        <Label className="font-medium">Cuisine Types</Label>
                        <div className="flex flex-wrap gap-2">
                          {CUISINES.map(c => (
                            <button key={c} type="button"
                              onClick={() => toggleListItem("cuisineTypes", c)}
                              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                                form.cuisineTypes.includes(c)
                                  ? "border-orange-500 bg-orange-500/10 text-orange-600"
                                  : "border-border hover:border-orange-500/50"
                              }`}>
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field 
                          id="seatingCapacity" 
                          label="Seating Capacity" 
                          icon={Users}
                          placeholder="e.g. 80" 
                          type="number"
                          value={form.seatingCapacity}
                          onChange={handleChange}
                        />
                        <Field 
                          id="dailySurplusCapacity" 
                          label="Daily Surplus (meals/kg)" 
                          icon={Utensils}
                          placeholder="e.g. 50" 
                          type="number"
                          value={form.dailySurplusCapacity}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-medium">
                          <Clock className="h-4 w-4 text-muted-foreground" /> Operating Hours (general)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Opens at</Label>
                            <Input 
                              type="time" 
                              name="openTime" 
                              value={form.openTime} 
                              onChange={handleChange} 
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Closes at</Label>
                            <Input 
                              type="time" 
                              name="closeTime" 
                              value={form.closeTime} 
                              onChange={handleChange} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium">Donation Preference</Label>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {DONATION_MODES.map(m => (
                            <button key={m.value} type="button"
                              onClick={() => setForm(p => ({ ...p, donationMode: m.value }))}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                form.donationMode === m.value
                                  ? "border-orange-500 bg-orange-500/10"
                                  : "border-border hover:bg-muted/50"
                              }`}>
                              <div className="font-semibold text-sm">{m.label}</div>
                              <div className="text-xs text-muted-foreground">{m.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium">Dietary Certifications</Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { key: "isHalalCertified", label: "Halal Certified", icon: "☪️" },
                            { key: "isVegetarianOnly", label: "Pure Vegetarian", icon: "🌱" },
                          ].map(cert => (
                            <label key={cert.key}
                              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer">
                              <input 
                                type="checkbox" 
                                name={cert.key}
                                checked={form[cert.key as keyof FormState] as boolean} 
                                onChange={handleChange}
                                className="rounded border-gray-300 text-orange-500 w-4 h-4" 
                              />
                              <span className="text-sm font-medium">{cert.icon} {cert.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* NGO step 3 */}
                  {form.role === "ngo" && (
                    <>
                      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Heart className="h-5 w-5 text-rose-500" /> Beneficiaries & Capacity
                      </h2>

                      <div className="space-y-2">
                        <Label className="font-medium">Who Do You Serve?</Label>
                        <div className="flex flex-wrap gap-2">
                          {BENEFICIARY_TYPES.map(b => (
                            <button key={b.value} type="button"
                              onClick={() => toggleListItem("beneficiaryTypes", b.value)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                                form.beneficiaryTypes.includes(b.value)
                                  ? "border-rose-500 bg-rose-500/10 text-rose-600"
                                  : "border-border hover:border-rose-500/50"
                              }`}>
                              {b.icon} {b.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field 
                          id="dailyBeneficiaries" 
                          label="Meals Served / Day" 
                          icon={Utensils}
                          placeholder="e.g. 200" 
                          type="number"
                          value={form.dailyBeneficiaries}
                          onChange={handleChange}
                        />
                        <Field 
                          id="totalBeneficiaries" 
                          label="Total Beneficiaries" 
                          icon={Users}
                          placeholder="e.g. 500" 
                          type="number"
                          value={form.totalBeneficiaries}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="font-medium flex items-center gap-2">
                          <Truck className="h-4 w-4 text-muted-foreground" /> Pickup Capability
                        </Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer">
                            <input 
                              type="checkbox" 
                              name="hasPickupVehicle"
                              checked={form.hasPickupVehicle} 
                              onChange={handleChange}
                              className="rounded border-gray-300 w-4 h-4" 
                            />
                            <div>
                              <div className="text-sm font-medium">🚐 We have a pickup vehicle</div>
                              <div className="text-xs text-muted-foreground">We can collect food ourselves</div>
                            </div>
                          </label>
                          <Field 
                            id="pickupRadius" 
                            label="Pickup Radius (km)" 
                            icon={MapPin}
                            placeholder="e.g. 10" 
                            type="number"
                            value={form.pickupRadius}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="font-medium flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-muted-foreground" /> Storage Capacity
                        </Label>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer">
                            <input 
                              type="checkbox" 
                              name="hasRefrigeration"
                              checked={form.hasRefrigeration} 
                              onChange={handleChange}
                              className="rounded border-gray-300 w-4 h-4" 
                            />
                            <div>
                              <div className="text-sm font-medium">❄️ Refrigeration Available</div>
                              <div className="text-xs text-muted-foreground">Can store perishables</div>
                            </div>
                          </label>
                          <Field 
                            id="storageCapacityKg" 
                            label="Storage Capacity (kg)" 
                            icon={Star}
                            placeholder="e.g. 100" 
                            type="number"
                            value={form.storageCapacityKg}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium">Preferred Food Types</Label>
                        <Input 
                          id="preferredFoodTypes" 
                          name="preferredFoodTypes"
                          value={form.preferredFoodTypes} 
                          onChange={handleChange}
                          placeholder="e.g. Cooked meals, Vegetables, Dairy (comma-separated)" 
                        />
                        <p className="text-xs text-muted-foreground">Separate with commas</p>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Navigation Buttons ───────────────────────────────────── */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
              {step < totalSteps ? (
                <Button type="submit"
                  className="flex-1 gradient-primary text-white hover:opacity-90 h-12 text-base font-semibold">
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}
                  className="flex-1 gradient-primary text-white hover:opacity-90 h-12 text-base font-semibold">
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating Account…</>
                  ) : (
                    <><UserPlus className="mr-2 h-4 w-4" />Create Account</>
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}