// src/components/layout/NGOLayout.tsx
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  BarChart3,
  LogOut,
  Bell,
  User,
  ChevronDown,
  Building2,
  Settings,
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
  { path: "/ngo", icon: Home, label: "Home" },
  { path: "/ngo/analytics", icon: BarChart3, label: "Analytics" },
];

export default function NGOLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Check if current path matches nav item
  const isActive = (path: string) => {
    if (path === "/ngo") {
      return location.pathname === "/ngo";
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
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "N"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {user?.organizationName || "NGO"}
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
                    {user?.organizationName && (
                      <span className="text-xs font-medium text-primary mt-1">
                        {user.organizationName}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Building2 className="h-4 w-4 mr-2" />
                  Organization Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
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
          {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors min-w-[60px]"
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            ))}
        </div>
      </nav>
    </div>
  );
}