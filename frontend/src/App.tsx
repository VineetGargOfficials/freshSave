import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Layout
import Layout from "@/components/Layout";

// Public pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Protected pages
import Dashboard from "@/pages/Dashboard";
import AddFood from "@/pages/AddFood";
import ScanFood from "@/pages/ScanFood";
import RecipeSuggestions from "@/pages/RecipeSuggestions";
import Donations from "@/pages/Donations";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="add-food" element={<AddFood />} />
            <Route path="scan" element={<ScanFood />} />
            <Route path="recipes" element={<RecipeSuggestions />} />
            <Route path="donations" element={<Donations />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;