// src/components/RoleBasedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export default function RoleBasedRoute({ 
  children, 
  allowedRoles,
  redirectTo = "/" 
}: RoleBasedRouteProps) {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'ngo':
        return <Navigate to="/ngo" replace />;
      case 'restaurant':
        return <Navigate to="/restaurant" replace />;
      case 'user':
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}