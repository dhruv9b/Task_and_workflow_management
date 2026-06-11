import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../loading/LoadingSpinner.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Simulate a brief delay to show loading state
    setTimeout(() => {
      logout(true); // Show message on logout
      setIsLoggingOut(false);
    }, 1000);
  };

  if (isLoggingOut) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white font-medium">
        <LoadingSpinner size="sm" variant="white" />
        Logging out...
      </div>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
    >
      Logout
    </button>
  );
}

