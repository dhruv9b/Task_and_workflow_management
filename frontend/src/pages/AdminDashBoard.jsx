import { useState, useEffect } from "react";
import UsersTable from "../users/UsersTable.jsx";
import CreateUserModal from "../users/CreateUserModal.jsx";
import LogoutButton from "../auth/Logout.jsx";
import { useNavigate } from "react-router-dom";
import PageTransition from "../loading/PageTransition.jsx";
import { getUsers } from "../services/userService";

export default function AdminDashboard() {
  const [roleToCreate, setRoleToCreate] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const res = await getUsers(0, 1000); // Get all users for stats
      const users = res.data.content;
      setTotalUsers(res.data.totalElements);
      
      const activeCount = users.filter(user => user.active === true).length;
      setActiveUsers(activeCount);
    } catch (error) {
      // Clean UI - silent catch
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = () => {
    fetchUserStats();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white">

        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 bg-zinc-900/20 backdrop-blur px-4 sm:px-8 py-4 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Admin Control Console
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Manage users, security configurations, and directory accounts</p>
          </div>
          <div className="flex items-center justify-end">
            <LogoutButton />
          </div>
        </header>

        {/* Centered Content */}
        <main className="flex justify-center">
          <div className="w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
            
            {/* Account Settings Card */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">System Settings</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Manage credentials, API access tokens, and admin profile data</p>
                </div>
                <button
                  onClick={() => navigate("/account-settings")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-md shadow-indigo-950/20"
                >
                  View Settings
                </button>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Directory Users</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">
                    {loading ? (
                      <span className="animate-pulse text-zinc-650">...</span>
                    ) : (
                      totalUsers.toLocaleString()
                    )}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center shadow-inner shrink-0">
                  <span className="text-green-500 text-lg">👥</span>
                </div>
              </div>
              
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Active Status Accounts</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">
                    {loading ? (
                      <span className="animate-pulse text-zinc-650">...</span>
                    ) : (
                      activeUsers.toLocaleString()
                    )}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center shadow-inner shrink-0">
                  <span className="text-blue-500 text-lg">📊</span>
                </div>
              </div>
              
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 flex items-center justify-between sm:col-span-2 lg:col-span-1">
                <div>
                  <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">System Operations</p>
                  <p className="text-xl sm:text-2xl font-extrabold text-green-400 mt-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                    Online
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center shadow-inner shrink-0">
                  <span className="text-green-400 text-lg">✓</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
              <h2 className="text-base sm:text-lg font-bold text-white">Administrative Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setRoleToCreate("ADMIN")}
                  className="w-full px-4 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-black font-extrabold text-xs transition duration-150 active:scale-95 shadow-lg shadow-green-950/20"
                >
                  + Add Admin Account
                </button>

                <button
                  onClick={() => setRoleToCreate("MANAGER")}
                  className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition duration-150 active:scale-95 shadow-lg shadow-blue-950/20"
                >
                  + Add Manager Account
                </button>

                <button
                  onClick={() => setRoleToCreate("EMPLOYEE")}
                  className="w-full px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition duration-150 active:scale-95 shadow-lg shadow-purple-950/20"
                >
                  + Add Employee Account
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-xl overflow-hidden">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">Directory Management</h2>
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <UsersTable onDataChange={handleDataChange} />
              </div>
            </div>

          </div>
        </main>

        {roleToCreate && (
          <CreateUserModal
            role={roleToCreate}
            onClose={() => setRoleToCreate(null)}
            onSuccess={handleDataChange}
          />
        )}
      </div>
    </PageTransition>
  );
}
