import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../auth/Logout.jsx";
import { getCurrentUser } from "../services/authService.js";
import { getMyLoginHistory } from "../services/loginHistoryService.js";

export default function AccountSettings() {
  const [tabId, setTabId] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch current user info first
      const userResponse = await getCurrentUser();
      setUserInfo(userResponse);
      
      console.log("User data from /me endpoint:", userResponse); // Debug log
      
      // Only fetch login history for all roles (employees can see their own)
      try {
        const historyResponse = await getMyLoginHistory(0, 10);
        console.log("Login history:", historyResponse); // Debug log
        setLoginHistory(historyResponse.content || []);
      } catch (historyError) {
        console.error("Failed to fetch login history:", historyError);
        // If 403, user doesn't have permission - set empty array
        if (historyError.response?.status === 403) {
          console.log("User doesn't have permission to view login history");
          setLoginHistory([]);
        } else {
          setLoginHistory([]); // Set empty array on other errors
        }
      }
      
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setError("Failed to load account information");
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleBasedNavigation = async () => {
    try {
      // Get fresh user data instead of relying on potentially stale state
      const freshUserData = await getCurrentUser();
      console.log("Navigating based on fresh role data:", freshUserData.role);
      
      switch(freshUserData.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "MANAGER":
          navigate("/manager");
          break;
        case "EMPLOYEE":
          navigate("/employees");
          break;
        default:
          console.log("Unknown role, defaulting to login");
          navigate("/");
      }
    } catch (error) {
      console.error("Failed to get fresh user data for navigation:", error);
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 animate-pulse">Loading account information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full">
            <span className="text-red-500 text-xl">⚠️</span>
          </div>
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchUserData}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <button
            onClick={handleRoleBasedNavigation}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold text-green-500">Account Settings</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage your account information and security</p>
          </div>
        </div>
        <LogoutButton />
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Account Information Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Account Information</h2>
          
          <div className="space-y-6">
            {/* Role Badge */}
            <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div>
                <label className="text-sm text-zinc-400">Role</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    userInfo?.role === "ADMIN" 
                      ? "bg-green-600/20 text-green-400 border border-green-600/30"
                      : userInfo?.role === "MANAGER"
                      ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                      : "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                  }`}>
                    {userInfo?.role || "UNKNOWN"}
                  </span>
                  <span className="text-zinc-500 text-sm">Current Role</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center">
                <span className="text-xl">
                  {userInfo?.role === "ADMIN" ? "👑" : userInfo?.role === "MANAGER" ? "👔" : "👤"}
                </span>
              </div>
            </div>

            {/* Name */}
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <label className="text-sm text-zinc-400">Full Name</label>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <span className="text-purple-500 text-sm">👤</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-medium">
                    {userInfo?.name || "No name set"}
                  </span>
                  {userInfo?.name && (
                    <span className="text-zinc-500 text-xs">Display name</span>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <label className="text-sm text-zinc-400">Email Address</label>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <span className="text-indigo-500 text-sm">📧</span>
                </div>
                <span className="text-white">{userInfo?.email || "No email available"}</span>
              </div>
            </div>

            {/* Account Status */}
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <label className="text-sm text-zinc-400">Account Status</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">{userInfo?.active ? "Active" : "Inactive"}</span>
                <span className="text-zinc-500 text-sm">• Account is in good standing</span>
              </div>
            </div>

            {/* User ID */}
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <label className="text-sm text-zinc-400">User ID</label>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-8 h-8 bg-zinc-600/20 rounded-full flex items-center justify-center">
                  <span className="text-zinc-400 text-sm">🆔</span>
                </div>
                <span className="text-white text-sm">{userInfo?.id || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
          
          <div className="space-y-6">
            {/* Change Password */}
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <span className="text-indigo-500 text-sm">🔐</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Password</h3>
                    <p className="text-zinc-400 text-sm">Change your account password</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/change-password")}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Login History - Show for all users */}
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-sm">📊</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Login History</h3>
                    <p className="text-zinc-400 text-sm">Your recent login activity</p>
                  </div>
                </div>
                {/* Only show "View All" button for ADMIN and MANAGER */}
                {(userInfo?.role === "ADMIN" || userInfo?.role === "MANAGER") && (
                  <button
                    onClick={() => navigate("/login-history")}
                    className="px-4 py-2 rounded-lg bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition"
                  >
                    View All
                  </button>
                )}
              </div>
              
              {/* Recent Logins List */}
              <div className="mt-4 space-y-2">
                {loginHistory.length > 0 ? (
                  loginHistory.slice(0, 3).map((login, index) => (
                    <div key={login.id || index} className="flex items-center justify-between p-2 bg-zinc-900/50 rounded border border-zinc-700">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          login.eventType === 'LOGIN' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-zinc-300 text-sm">
                          {login.eventType === 'LOGIN' ? 'Login' : 'Logout'}
                        </span>
                      </div>
                      <span className="text-zinc-500 text-xs">
                        {new Date(login.eventTime).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <span className="text-zinc-500 text-sm">No recent login activity</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-8">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
          <div className="p-4 bg-red-900/10 rounded-lg border border-red-800/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Sign Out</h3>
                <p className="text-zinc-400 text-sm">Sign out from your account on this device</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
