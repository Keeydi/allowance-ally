import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute - Client-side route guard for authenticated and admin routes.
 * 
 * SECURITY NOTE: This component provides UI-level protection only.
 * The actual security boundary is enforced by Row Level Security (RLS) policies
 * in the database. All admin operations (video_tips INSERT/UPDATE/DELETE, 
 * user_roles management, etc.) are protected by RLS policies that use the
 * has_role() function to verify admin privileges server-side.
 * 
 * Even if an attacker bypasses these client-side checks (e.g., via DevTools),
 * they cannot perform privileged operations because the database will reject
 * unauthorized requests.
 */
const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // UI-only check - actual authorization enforced via RLS policies
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
