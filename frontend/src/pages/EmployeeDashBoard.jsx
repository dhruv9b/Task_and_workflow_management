import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../auth/Logout.jsx";
import PageTransition from "../loading/PageTransition.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useWebSocket } from "../context/WebSocketContext";
import { getMyLoginHistory } from "../services/loginHistoryService.js";
import { getMyAssignedTasks, completeTask, downloadTaskAttachment } from "../services/taskService.js";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { connected, setTaskCallback, publishTaskUpdate } = useWebSocket();

  const [myLoginHistory, setMyLoginHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const fetchMyTasks = useCallback(async () => {
    try {
      setTasksLoading(true);
      const data = await getMyAssignedTasks();
      setTasks(data);
    } catch (e) {
      console.error('Failed to fetch assigned tasks', e);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchMyLoginHistory = async () => {
    try {
      const data = await getMyLoginHistory(0, 5);
      setMyLoginHistory(data.content || []);
    } catch (e) {
      console.error('Failed to fetch login history', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyLoginHistory();
      fetchMyTasks();
    }
  }, [isAuthenticated, user, fetchMyTasks]);

  // Set up WebSocket callback for real-time task updates
  const handleTaskUpdate = useCallback((data) => {
    if (data) {
      fetchMyTasks();
    }
  }, [fetchMyTasks]);

  useEffect(() => {
    if (connected) {
      setTaskCallback(handleTaskUpdate);
    }
  }, [connected, setTaskCallback, handleTaskUpdate]);

  const handleCompleteTask = useCallback(async (taskId) => {
    try {
      await completeTask(taskId, publishTaskUpdate);
      fetchMyTasks();
    } catch (e) {
      alert("Failed to submit task done indicator.");
    }
  }, [publishTaskUpdate, fetchMyTasks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-red-400">Session expired. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white">
        
        {/* Top Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 bg-zinc-900/20 backdrop-blur px-4 sm:px-8 py-4 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Employee Workspace
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Stay aligned, track task statuses, and view notifications</p>
          </div>
          <div className="flex items-center justify-end">
            <LogoutButton />
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">
          {/* Welcome Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 border border-green-500/20 rounded-full shadow-inner">
                <span className="text-3xl sm:text-4xl">👋</span>
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Welcome back, <span className="text-green-400">{user?.name || user?.email}</span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
                  Keep tabs on pending assignments, updates from management, and overall progress.
                </p>
              </div>
              <button
                onClick={() => navigate("/employees/announcements")}
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-black hover:from-green-400 hover:to-emerald-500 transition duration-200 active:scale-95 shadow-lg shadow-green-950/20"
              >
                View Announcements
              </button>
            </div>
          </div>

          {/* Quick Actions / Navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-indigo-400 text-lg">⚙️</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Account Settings</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Configure passwords and personal details</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/account-settings")}
                className="mt-5 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 hover:text-white border border-zinc-700/60 text-xs font-semibold transition"
              >
                Configure Settings
              </button>
            </div>
            
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-teal-400 text-lg">📝</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">View Login History</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Review recent security access events</p>
                </div>
              </div>
              <button
                onClick={() => navigate("/login-history")}
                className="mt-5 w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 hover:text-white border border-zinc-700/60 text-xs font-semibold transition"
              >
                Access History Log
              </button>
            </div>
          </div>

          {/* My Assigned Tasks Card */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-green-500 text-base">📋</span> Active Assignment Board
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Tasks assigned by your manager and deadline trackers</p>
              </div>
              <button
                onClick={fetchMyTasks}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition text-xs border border-zinc-700/80"
              >
                🔄 Refresh Board
              </button>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="inline-flex items-center justify-center w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isCompleted = task.status === "COMPLETED";
                  const deadlineDate = new Date(task.deadline);
                  const isOverdue = new Date() > deadlineDate;

                  let badgeStyle = "";
                  let badgeLabel = "";
                  if (isCompleted) {
                    const completedDate = new Date(task.completedAt);
                    if (completedDate <= deadlineDate) {
                      badgeStyle = "bg-green-500/10 text-green-400 border border-green-500/20";
                      badgeLabel = "Completed (On Time)";
                    } else {
                      badgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
                      badgeLabel = "Completed (Late)";
                    }
                  } else {
                    if (isOverdue) {
                      badgeStyle = "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse";
                      badgeLabel = "Overdue";
                    } else {
                      badgeStyle = "bg-teal-500/10 text-teal-400 border border-teal-500/20";
                      badgeLabel = "Active";
                    }
                  }

                  return (
                    <div
                      key={task.id}
                      className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 hover:border-zinc-800 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-bold text-white text-sm sm:text-base">{task.title}</h3>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${badgeStyle}`}>
                            {badgeLabel}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2">{task.description}</p>
                        
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            📅 Assigned: <span className="text-zinc-400 font-mono">{new Date(task.createdAt).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            ⏰ Deadline: <span className={`font-mono ${isOverdue && !isCompleted ? 'text-red-400' : 'text-zinc-400'}`}>
                              {new Date(task.deadline).toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto flex-row justify-end">
                        {task.fileName && (
                          <button
                            onClick={() => downloadTaskAttachment(task.id, task.fileName)}
                            className="flex-1 md:flex-none px-3 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 rounded-lg flex items-center justify-center gap-1.5 transition"
                          >
                            📁 Attachment
                          </button>
                        )}

                        {!isCompleted && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className="flex-1 md:flex-none px-3.5 py-2 text-xs font-bold bg-green-600 hover:bg-green-500 text-black rounded-lg flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
                          >
                            ✔️ Task Done
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-zinc-950/20 rounded-xl border border-dashed border-zinc-850">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-zinc-900 rounded-full mb-3">
                  <span className="text-zinc-400 text-xl">🎉</span>
                </div>
                <p className="text-zinc-300 text-sm font-semibold">No tasks assigned to you right now.</p>
                <p className="text-zinc-500 text-xs mt-1">Excellent! You are all caught up.</p>
              </div>
            )}
          </div>

          {/* Recent Login Activity Card */}
          <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-850">
              <div>
                <h2 className="text-lg font-bold text-white">Recent Security Logs</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Your recent access events</p>
              </div>
              <button
                onClick={() => navigate("/login-history")}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs border border-zinc-700/80 transition"
              >
                View All
              </button>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-flex items-center justify-center w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : myLoginHistory.length > 0 ? (
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
        </main>
      </div>
    </PageTransition>
  );
}


