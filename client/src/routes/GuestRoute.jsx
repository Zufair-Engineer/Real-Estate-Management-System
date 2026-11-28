
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const GuestRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  console.log("Authenticated:", isAuthenticated);
  console.log("Loading:", loading);

  // Wait until authentication check completes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect authenticated users
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Allow guest users
  return <Outlet />;
};

export default GuestRoute;
