// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Layout
import Layout from "@/components/layout/Layout";
import NGOLayout from "@/components/layout/NGOLayout";
import RestaurantLayout from "@/components/layout/RestaurantLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyEmail from "@/pages/auth/VerifyEmail";

// User pages (Individual)
import Dashboard from "@/pages/user/Dashboard";
import AddFood from "@/pages/user/AddFood";
import ScanFood from "@/pages/user/ScanFood";
import RecipeSuggestions from "@/pages/user/RecipeSuggestions";
import Donations from "@/pages/user/Donations";
import OffersDiscounts from "@/pages/user/OffersDiscounts";
import UserProfile from "@/pages/user/UserProfile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDeliveryPartnerships from "@/pages/admin/AdminDeliveryPartnerships";
import AdminRestaurantReviews from "@/pages/admin/AdminRestaurantReviews";

// NGO pages
import NGODashboard from "@/pages/ngo/NGODashboard";
import NGOAnalytics from "@/pages/ngo/NGOAnalytics";
import NGOProfile from "./pages/ngo/NGOProfile";
import NGOPartners from "./pages/ngo/NGOPartners";

// Restaurant pages
import RestaurantHome from "@/pages/restaurants/RestaurantDashboard";
import ListFood from "@/pages/restaurants/ListFood";
import DonationHistory from "@/pages/restaurants/DonationHistory";
import RestaurantAnalytics from "@/pages/restaurants/RestaurantAnalytics";
import ConnectNGOs from "./pages/restaurants/ConnectNGO";
import RestaurantProfile from "./pages/restaurants/RestaurantProfile";

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Role-based redirect component
function RoleBasedRedirect() {
  const { user, loading, token } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'ngo':
      return <Navigate to="/ngo" replace />;
    case 'restaurant':
      return <Navigate to="/restaurant" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'user':
    default:
      return <Navigate to="/dashboard" replace />;
  }
}

// Protected route for user role only
function UserProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect non-users to their respective dashboards
  if (user.role === 'ngo') {
    return <Navigate to="/ngo" replace />;
  }

  if (user.role === 'restaurant') {
    return <Navigate to="/restaurant" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Protected route for NGO
function NGOProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ngo') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Protected route for Restaurant
function RestaurantProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'restaurant') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Auth route (redirect if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, token } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (token && user) {
    // Redirect to appropriate dashboard
    switch (user.role) {
      case 'ngo':
        return <Navigate to="/ngo" replace />;
      case 'restaurant':
        return <Navigate to="/restaurant" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect based on role */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* ==================== AUTH ROUTES ==================== */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        }
      />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* ==================== USER ROUTES ==================== */}
      <Route
        path="/dashboard"
        element={
          <UserProtectedRoute>
            <Layout />
          </UserProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      <Route
        path="/add-food"
        element={
          <UserProtectedRoute>
            <Layout />
          </UserProtectedRoute>
        }
      >
        <Route index element={<AddFood />} />
      </Route>

      <Route
        path="/scan"
        element={
          <UserProtectedRoute>
            <Layout />
          </UserProtectedRoute>
        }
      >
        <Route index element={<ScanFood />} />
      </Route>

      <Route
        path="/recipes"
        element={
          <UserProtectedRoute>
            <Layout />
          </UserProtectedRoute>
        }
      >
        <Route index element={<RecipeSuggestions />} />
      </Route>

      <Route
        path="/donations"
        element={
          <UserProtectedRoute>
            <Layout />
          </UserProtectedRoute>
        }
      >
        <Route index element={<Donations />} />
      </Route>

      <Route
        path="/offers"
        element={
          <UserProtectedRoute>
            <Layout />
          </UserProtectedRoute>
        }
      >
        <Route index element={<OffersDiscounts />} />
      </Route>

      <Route
        path="/profile"
        element={
          <UserProtectedRoute>
            <Layout />
          </UserProtectedRoute>
        }
      >
        <Route index element={<UserProfile />} />
      </Route>

      {/* ==================== NGO ROUTES ==================== */}
      <Route path="/ngo" element={<NGOProtectedRoute><NGOLayout /></NGOProtectedRoute>}>
        <Route index element={<NGODashboard />} />
        <Route path="analytics" element={<NGOAnalytics />} />
        <Route path="profile" element={<NGOProfile />} />
        <Route path="partners" element={<NGOPartners />} />
      </Route>
 {/* ==================== RESTAURANT ROUTES ==================== */}
      <Route path="/restaurant" element={<RestaurantProtectedRoute><RestaurantLayout /></RestaurantProtectedRoute>}>
        <Route index element={<RestaurantHome />} />
        <Route path="list-food" element={<ListFood />} />
        <Route path="connect-ngos" element={<ConnectNGOs/>}/>
        <Route path="history" element={<DonationHistory />} />
        <Route path="analytics" element={<RestaurantAnalytics />} />
        <Route path="profile" element={<RestaurantProfile />} />
      </Route>

      <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="delivery-partnerships" element={<AdminDeliveryPartnerships />} />
        <Route path="restaurant-reviews" element={<AdminRestaurantReviews />} />
      </Route>

      {/* ==================== CATCH ALL ==================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
