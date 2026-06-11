import { useEffect, useState } from "react";
import { fetchMyTeam } from "../services/managerService";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../auth/Logout.jsx";
import FullPageLoader from "../loading/FullPageLoader.jsx";
import EmployeeLoginHistoryModal from "../components/EmployeeLoginHistoryModal.jsx";
import AssignTaskModal from "../components/AssignTaskModal.jsx";
import ManagerTasksHistoryModal from "../components/ManagerTasksHistoryModal.jsx";
import { getMyLoginHistory } from "../services/loginHistoryService.js";
import { getCurrentUser } from "../services/authService.js";
import { useWebSocket } from "../context/WebSocketContext";

export default function ManagerPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState(null);
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [myLoginHistory, setMyLoginHistory] = useState([]);
  const navigate = useNavigate();
  const { connected, setTaskCallback } = useWebSocket();

  useEffect(() => {
    const loadData = async () => {
      try {
        await getCurrentUser();
        const teamData = await fetchMyTeam();
        setTeam(teamData);
        
        try {
          const historyData = await getMyLoginHistory(0, 5);
          setMyLoginHistory(historyData.content || []);
        } catch (historyError) {
          setMyLoginHistory([]);
        }
      } catch (error) {
        // Silent catch for clean UI
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Set up WebSocket callback for real-time task updates
  useEffect(() => {
    if (connected) {
      setTaskCallback((data) => {
        if (data && data.eventType === 'TASK_COMPLETED') {
          // Task completion updates can trigger automatic state refresh here if required.
        }
      });
    }
  }, [connected, setTaskCallback]);

  const handleViewHistory = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleOpenAssignTask = (employee) => {
    setSelectedEmployeeForTask(employee);
    setIsAssignTaskOpen(true);
  };

  const handleCloseAssignTask = () => {
    setIsAssignTaskOpen(false);
    setSelectedEmployeeForTask(null);
  };

  const handleRefreshHistory = async () => {
    try {
      const historyData = await getMyLoginHistory(0, 5);
      setMyLoginHistory(historyData.content || []);
    } catch (error) {
      setMyLoginHistory([]);
    }
  };

  if (loading) {
    return <FullPageLoader text="Loading workspace..." />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      
      {/* Top Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 bg-zinc-900/20 backdrop-blur px-4 sm:px-8 py-4 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Manager Control Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Oversee operations, delegate tasks, and monitor security</p>
        </div>
        <div className="flex items-center justify-end">
          <LogoutButton />
        </div>
      </header>
      
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
        {/* Account Settings Card */}
        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Account Control</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Manage your credentials, login metrics, and configuration</p>
            </div>
            <button
              onClick={() => navigate("/account-settings")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/60 text-xs font-semibold transition"
            >
              Account Details
            </button>
          </div>
        </div>

        {/* Team Card */}
        <div className="rounded-2xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-zinc-800/80 gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-green-500 text-base">👥</span> My Team Directory
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {team.length} active {team.length === 1 ? 'member' : 'members'} under your management
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="w-full sm:w-auto rounded-xl bg-indigo-600/90 hover:bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5"
              >
                📊 Team Task Overview
              </button>
              <button
                onClick={() => navigate("/manager/announcements")}
                className="w-full sm:w-auto rounded-xl bg-green-600 hover:bg-green-500 px-4 py-2.5 text-xs font-bold text-black transition flex items-center justify-center"
              >
                Manage Announcements
              </button>
            </div>
          </div>

          {team.length === 0 ? (
            <div className="text-center py-12 bg-zinc-950/20 rounded-xl border border-dashed border-zinc-850">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full mb-3">
                <span className="text-zinc-500 text-xl">👥</span>
              </div>
              <p className="text-zinc-400 text-xs font-semibold">No team members assigned yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-850">
              {team.map((user, index) => (
                <li
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4 transition hover:bg-zinc-800/20 rounded-xl px-2"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 border border-zinc-700/60 rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-sm font-semibold text-zinc-300">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200">
                          {user.name || user.email}
                        </span>
                        {user.name && (
                          <span className="text-xs text-zinc-500 font-mono">{user.email}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <span className="rounded-full bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                      Active
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewHistory(user)}
                        className="px-3 py-2 text-xs rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-350 hover:text-white border border-zinc-700/60 transition flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        History
                      </button>
                      <button
                        onClick={() => handleOpenAssignTask(user)}
                        className="px-3 py-2 text-xs rounded-xl bg-green-600 hover:bg-green-500 text-black font-extrabold transition flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Assign Task
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Login Activity Card */}
        <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-850">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Security Logs</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Your recent access events</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRefreshHistory}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition text-xs border border-zinc-700"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => navigate("/login-history")}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs border border-zinc-700 transition"
              >
                View All
              </button>
            </div>
          </div>

          {myLoginHistory.length > 0 ? (
            <div className="space-y-2">
              {myLoginHistory.map((login, index) => (
                <div key={login.id || index} className="flex items-center justify-between p-3 bg-zinc-950/30 rounded-xl border border-zinc-850/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      login.eventType === 'LOGIN' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-zinc-300 text-xs sm:text-sm font-medium">
                      {login.eventType === 'LOGIN' ? 'Authorized Login' : 'Session Terminated'}
                    </span>
                  </div>
                  <span className="text-zinc-500 text-xs font-mono">
                    {new Date(login.eventTime).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-zinc-900 rounded-full mb-3 animate-pulse">
                <span className="text-zinc-500 text-lg">📊</span>
              </div>
              <p className="text-zinc-500 text-xs">No recent login activity</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Employee Login History Modal */}
      <EmployeeLoginHistoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employee={selectedEmployee}
      />

      {/* Assign Task Modal */}
      <AssignTaskModal
        isOpen={isAssignTaskOpen}
        onClose={handleCloseAssignTask}
        employee={selectedEmployeeForTask}
      />

      {/* Team Tasks History Modal */}
      <ManagerTasksHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
