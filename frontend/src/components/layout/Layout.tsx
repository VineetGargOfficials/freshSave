// src/components/Layout.tsx
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Plus,
  Camera,
  ChefHat,
  Heart,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/add-food", icon: Plus, label: "Add" },
  { path: "/scan", icon: Camera, label: "Scan" },
  { path: "/recipes", icon: ChefHat, label: "Recipes" },
  { path: "/donations", icon: Heart, label: "Donate" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Check if current path matches nav item
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold gradient-text">🥗 FreshSave</h1>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                2
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Individual User
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t safe-area-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 px-3 py-2 relative"
              >
                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full gradient-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
                    active
                      ? "gradient-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}