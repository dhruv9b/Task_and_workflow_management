import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../auth/Logout.jsx";
import PageTransition from "../loading/PageTransition.jsx";
import { getMyLoginHistory, getAllLoginHistory, getRecentLogins } from "../services/loginHistoryService.js";
import { getCurrentUser } from "../services/authService.js";

export default function LoginHistory() {
  const navigate = useNavigate();
  const [loginHistory, setLoginHistory] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("my");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      
      // Set default tab based on user role
      if (user.role === "ADMIN" || user.role === "MANAGER") {
        setActiveTab("my"); // Start with "My Logins" for all users
      }
      
      fetchLoginHistory();
    } catch (error) {
      console.error("Failed to load current user:", error);
      setError("Failed to load user information");
      setLoading(false);
      
      if (error.response?.status === 401) {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchLoginHistory();
    }
  }, [activeTab, page, currentUser]);

  const fetchLoginHistory = async () => {
    try {
      setLoading(true);
      setError("");

      let response;
      if (activeTab === "my") {
        response = await getMyLoginHistory(page, 10);
      } else if (activeTab === "all") {
        // Only admins can see all users
        if (currentUser?.role === "ADMIN") {
          response = await getAllLoginHistory(page, 10);
        } else {
          setError("You don't have permission to view all users' login history");
          setLoginHistory([]);
          setTotalPages(0);
          setLoading(false);
          return;
        }
      } else if (activeTab === "recent") {
        // Recent should show current user's own recent logins (not all users)
        console.log("Fetching recent logins for current user only");
        
        // Get current user's recent logins by using my-logins with larger page size
        // then filter for recent entries
        response = await getMyLoginHistory(0, 100); // Get more entries to filter
        
        if (response && response.content) {
          // Filter for last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const recentLogins = response.content.filter(login => {
            const loginDate = new Date(login.eventTime);
            return loginDate >= sevenDaysAgo;
          });
          
          console.log(`Found ${recentLogins.length} recent logins for ${currentUser.email}`);
          
          setLoginHistory(recentLogins);
          setTotalPages(1); // Recent is a single page
          setLoading(false);
          return;
        }
      }

      setLoginHistory(response.content || []);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch login history:", error);
      setError("Failed to load login history");
      
      if (error.response?.status === 401) {
        navigate("/");
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view this login history");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventTypeIcon = (eventType) => {
    return eventType === 'LOGIN' ? '🟢' : '🔴';
  };

  const getEventTypeLabel = (eventType) => {
    return eventType === 'LOGIN' ? 'Login' : 'Logout';
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-green-500">Login History</h1>
            <p className="text-sm text-zinc-400 mt-1">Monitor user login activity</p>
          </div>
          <LogoutButton />
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-6 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-zinc-800">
            <button
              onClick={() => handleTabChange("my")}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "my"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              My Logins
            </button>
            
            {/* Recent logins for all users (shows their own recent activity) */}
            <button
              onClick={() => handleTabChange("recent")}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "recent"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Recent (7 Days)
            </button>
            
            {/* All users only for admins */}
            {currentUser?.role === "ADMIN" && (
              <button
                onClick={() => handleTabChange("all")}
                className={`px-4 py-2 font-medium transition ${
                  activeTab === "all"
                    ? "text-green-500 border-b-2 border-green-500"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All Users
              </button>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchLoginHistory}
                className="mt-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-400">Loading login history...</p>
              </div>
            </div>
          ) : (
            /* Login History Table */
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800 border-b border-zinc-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        User Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        User Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {loginHistory.length > 0 ? (
                      loginHistory.map((login) => (
                        <tr key={login.id} className="hover:bg-zinc-800/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span>{getEventTypeIcon(login.eventType)}</span>
                              <span className={`text-sm font-medium ${
                                login.eventType === 'LOGIN' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {getEventTypeLabel(login.eventType)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                            {login.userEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                            {login.userName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                            {formatDate(login.eventTime)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-zinc-500">
                          No login history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-zinc-700 flex items-center justify-between">
                  <div className="text-sm text-zinc-400">
                    Page {page + 1} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1}
                      className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}
