import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, UtensilsCrossed, Heart, Scan } from "lucide-react";
import { cn } from "@/lib/utils";
import { getExpiringItems } from "@/lib/storage";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/add", icon: PlusCircle, label: "Add Food" },
  { to: "/recipes", icon: UtensilsCrossed, label: "Recipes" },
  { to: "/donations", icon: Heart, label: "Donate" },
  { to: "/scan", icon: Scan, label: "Scan" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const expiringCount = getExpiringItems(3).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <span className="text-lg font-bold text-primary-foreground">🍃</span>
            </div>
            <span className="text-xl font-bold text-foreground">FreshSave</span>
          </Link>
          {expiringCount > 0 && (
            <div className="flex items-center gap-2 rounded-full bg-warning/10 px-3 py-1 text-sm font-medium text-warning">
              <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
              {expiringCount} expiring soon
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="container py-6 pb-24">{children}</main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="container flex items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
