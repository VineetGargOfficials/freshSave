// src/components/common/ComingSoonWrapper.tsx
import { motion } from "framer-motion";
import { 
  Construction, 
  Rocket, 
  Bell, 
  ArrowLeft, 
  LogOut,
  Mail,
  Phone,
  Building2,
  ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface ComingSoonWrapperProps {
  title: string;
  subtitle: string;
  description: string;
  features: Feature[];
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  estimatedLaunch?: string;
}

export default function ComingSoonWrapper({
  title,
  subtitle,
  description,
  features,
  icon,
  gradientFrom,
  gradientTo,
  accentColor,
  estimatedLaunch = "Q2 2025"
}: ComingSoonWrapperProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email || user?.email) {
      setSubscribed(true);
      toast.success("You'll be notified when we launch!", {
        description: "Check your email for updates."
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradientFrom} via-background ${gradientTo}`}>
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center text-xl`}>
                {icon}
              </div>
              <div>
                <h1 className="font-bold text-foreground">{title}</h1>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Welcome,</span>
                  <span className="font-medium text-foreground">{user.name}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className={`inline-flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${accentColor} mb-6 shadow-2xl`}
          >
            <span className="text-6xl">{icon}</span>
          </motion.div>

          <Badge variant="outline" className="mb-4 text-yellow-600 border-yellow-500/30 bg-yellow-500/10">
            <Construction className="h-3 w-3 mr-1" />
            Under Development
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            {title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge className="bg-primary/10 text-primary border-primary/30">
              <Rocket className="h-3 w-3 mr-1" />
              Estimated Launch: {estimatedLaunch}
            </Badge>
          </div>
        </motion.div>

        {/* User Info Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="glass-card p-6 max-w-xl mx-auto">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${accentColor} flex items-center justify-center text-2xl`}>
                  {user.role === 'ngo' ? '🤝' : '🍽️'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground">{user.name}</h3>
                  {user.organizationName && (
                    <p className="text-primary font-medium">{user.organizationName}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {user.role === 'ngo' ? 'NGO' : 'Restaurant'}
                </Badge>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-foreground text-center mb-8 flex items-center justify-center gap-2">
            <Rocket className="h-6 w-6 text-primary" />
            Features Coming Soon
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className="glass-card p-5 h-full hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Notification Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card p-8 max-w-xl mx-auto text-center">
            {!subscribed ? (
              <>
                <Bell className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Get Early Access
                </h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to know when we launch. We'll notify you via email.
                </p>
                <form onSubmit={handleNotify} className="flex gap-2 max-w-md mx-auto">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    defaultValue={user?.email || ""}
                    className="flex-1"
                  />
                  <Button type="submit" className={`bg-gradient-to-r ${accentColor} text-white`}>
                    Notify Me
                  </Button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h3 className="text-xl font-semibold text-success mb-2">
                  You're on the list!
                </h3>
                <p className="text-muted-foreground">
                  We'll send you an email as soon as this feature is ready.
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Have questions or feedback? We'd love to hear from you!
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" asChild>
              <a href="mailto:support@freshsave.app">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://freshsave.app" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Website
              </a>
            </Button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <span className="font-semibold text-foreground">FreshSave</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Reducing food waste, one meal at a time. 💚
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}