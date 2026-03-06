import { Outlet, useNavigate } from "react-router-dom";
import { Home, PlusCircle, Camera, Leaf, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: PlusCircle, label: "Add", path: "/add-food" },
    { icon: Camera, label: "Scan", path: "/scan" },
    { icon: Leaf, label: "Recipes", path: "/recipes" },
    { icon: Heart, label: "Donate", path: "/donations" },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold gradient-text">🥗 FreshSave</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Hi, {user?.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t">
        <div className="container mx-auto px-2">
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
        </div>
      </nav>
    </div>
  );
}