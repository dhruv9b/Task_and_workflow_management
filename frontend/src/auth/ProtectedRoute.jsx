import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, checkForcePasswordChange, loading, getToken, isTokenExpired, logout } = useAuth();

  // 🔥 1. Wait until auth is initialized
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 animate-pulse">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // 🔥 2. Extra safety check (rehydration fallback)
  // Check authentication and token validity
  const token = getToken();

  // Redirect if not authenticated or token missing
  if (!isAuthenticated || !token) {
    // Don't clear localStorage here - let AuthContext handle it
    // The token might be valid but AuthContext hasn't finished initializing yet
    return <Navigate to="/" replace />;
  }
  // If token exists but is expired, check grace period before redirecting
  if (token && isTokenExpired(token)) {
    const loginTime = localStorage.getItem('loginTime');
    const now = Date.now();
    const isRecentLogin = loginTime && (now - parseInt(loginTime)) < 60000; // 1 minute grace period
    
    if (!isRecentLogin) {
      logout();
      return <Navigate to="/" replace />;
    }
  }

  // 🔥 3. Force password change (only if logged in)
  if (isAuthenticated && checkForcePasswordChange()) {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}
