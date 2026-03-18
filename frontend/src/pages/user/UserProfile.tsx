import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import RoleBadges from "@/components/common/RoleBadges";
import { toast } from "sonner";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    bio: "",
    street: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      bio: user.bio || "",
      street: user.address?.street || "",
      area: user.address?.area || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      zipCode: user.address?.zipCode || "",
      country: user.address?.country || "India",
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (!user) {
      setIsEditing(false);
      return;
    }

    setForm({
      name: user.name || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      bio: user.bio || "",
      street: user.address?.street || "",
      area: user.address?.area || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      zipCode: user.address?.zipCode || "",
      country: user.address?.country || "India",
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: form.name,
        phoneNumber: form.phoneNumber || undefined,
        bio: form.bio || undefined,
        address: {
          street: form.street || undefined,
          area: form.area || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          zipCode: form.zipCode || undefined,
          country: form.country || undefined,
        },
      });

      await refreshUser();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account details and earned badges
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="glass-card p-6 bg-gradient-to-r from-primary/10 to-emerald-500/10 border-primary/20">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="h-28 w-28 rounded-2xl gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {form.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              {user?.emailVerified ? (
                <Badge className="mt-3 bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified Account
                </Badge>
              ) : (
                <Badge variant="outline" className="mt-3 text-amber-500 border-amber-500/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Verification Pending
                </Badge>
              )}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="text-2xl font-bold h-auto py-1 px-2 mb-3"
                  placeholder="Your Name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-foreground">{form.name || "FreshSave User"}</h2>
              )}

              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
                <div className="rounded-xl bg-background/50 p-4">
                  <Mail className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground break-all">{form.email || "Not added"}</p>
                </div>
                <div className="rounded-xl bg-background/50 p-4">
                  <Phone className="h-5 w-5 text-emerald-500 mb-2" />
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{form.phoneNumber || "Not added"}</p>
                </div>
                <div className="rounded-xl bg-background/50 p-4">
                  <MapPin className="h-5 w-5 text-sky-500 mb-2" />
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="font-medium text-foreground">{form.city || "Not added"}</p>
                </div>
                <div className="rounded-xl bg-background/50 p-4">
                  <Calendar className="h-5 w-5 text-amber-500 mb-2" />
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-medium text-foreground">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Not available"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-sm text-muted-foreground">About You</Label>
                {isEditing ? (
                  <Textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1"
                    placeholder="Tell others a little about yourself and why you use FreshSave."
                  />
                ) : (
                  <p className="text-muted-foreground mt-2">
                    {form.bio || "Add a short bio so your profile feels more personal."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <RoleBadges />

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-primary" />
              Contact Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <Input value={form.email} disabled className="mt-1 opacity-80" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone Number</Label>
                {isEditing ? (
                  <Input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="font-medium text-foreground mt-1">{form.phoneNumber || "-"}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              Address
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Street</Label>
                {isEditing ? (
                  <Input name="street" value={form.street} onChange={handleChange} className="mt-1" placeholder="Street" />
                ) : (
                  <p className="font-medium text-foreground mt-1">{form.street || "-"}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Area</Label>
                {isEditing ? (
                  <Input name="area" value={form.area} onChange={handleChange} className="mt-1" placeholder="Area / Locality" />
                ) : (
                  <p className="font-medium text-foreground mt-1">{form.area || "-"}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">City</Label>
                {isEditing ? (
                  <Input name="city" value={form.city} onChange={handleChange} className="mt-1" placeholder="City" />
                ) : (
                  <p className="font-medium text-foreground mt-1">{form.city || "-"}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">State</Label>
                {isEditing ? (
                  <Input name="state" value={form.state} onChange={handleChange} className="mt-1" placeholder="State" />
                ) : (
                  <p className="font-medium text-foreground mt-1">{form.state || "-"}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">PIN Code</Label>
                {isEditing ? (
                  <Input name="zipCode" value={form.zipCode} onChange={handleChange} className="mt-1" placeholder="PIN Code" />
                ) : (
                  <p className="font-medium text-foreground mt-1">{form.zipCode || "-"}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Country</Label>
                {isEditing ? (
                  <Input name="country" value={form.country} onChange={handleChange} className="mt-1" placeholder="Country" />
                ) : (
                  <p className="font-medium text-foreground mt-1">{form.country || "India"}</p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
