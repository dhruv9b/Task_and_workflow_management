import { useState, useEffect } from "react";
import { getManagerTaskStats, downloadTaskAttachment } from "../services/taskService";

export default function ManagerTasksHistoryModal({ isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getManagerTaskStats();
      setStats(response);
    } catch (err) {
      console.error("Failed to load task history stats:", err);
      setError("Failed to load team task statistics.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getTaskStatusInfo = (task) => {
    const isCompleted = task.status === "COMPLETED";
    const deadlineDate = new Date(task.deadline);
    const isDeadlinePassed = new Date() > deadlineDate;

    if (isCompleted) {
      const completedDate = new Date(task.completedAt);
      if (completedDate <= deadlineDate) {
        return {
          label: "Done Before Deadline",
          style: "bg-green-500/10 text-green-400 border border-green-500/20",
          dot: "bg-green-400"
        };
      } else {
        return {
          label: "Done After Deadline",
          style: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
          dot: "bg-amber-400"
        };
      }
    } else {
      if (isDeadlinePassed) {
        return {
          label: "Not Done (Overdue)",
          style: "bg-red-500/10 text-red-400 border border-red-500/20",
          dot: "bg-red-500"
        };
      } else {
        return {
          label: "Pending",
          style: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
          dot: "bg-teal-400"
        };
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform scale-100 transition-all duration-300 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-900/40">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-green-500">📊</span> Team Task Tracker & History
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Task assignment history, completion status, and success metrics
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-all p-2 hover:bg-zinc-900 rounded-xl border border-transparent hover:border-zinc-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Panel */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
              <p className="text-red-400 text-sm font-semibold mb-2">{error}</p>
              <button
                onClick={fetchStats}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition"
              >
                Retry Load
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-zinc-500">Loading performance data...</p>
              </div>
            </div>
          ) : stats ? (
            <>
              {/* Stats Card Rings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ring 1: Done Before Deadline */}
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Done Before Deadline</span>
                    <h3 className="text-3xl font-extrabold text-green-400">{stats.doneBeforeDeadlineCount}</h3>
                    <p className="text-xs text-zinc-500">tasks completed on-time</p>
                  </div>
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" className="stroke-zinc-800" strokeWidth="4" fill="transparent" />
                      <circle cx="32" cy="32" r="28" className="stroke-green-500" strokeWidth="4" fill="transparent"
                        strokeDasharray={175.9}
                        strokeDashoffset={175.9 - (175.9 * stats.doneBeforeDeadlinePercentage) / 100}
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white font-mono">{Math.round(stats.doneBeforeDeadlinePercentage)}%</span>
                  </div>
                </div>

                {/* Ring 2: Done After Deadline */}
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Done After Deadline</span>
                    <h3 className="text-3xl font-extrabold text-amber-400">{stats.doneAfterDeadlineCount}</h3>
                    <p className="text-xs text-zinc-500">tasks completed late</p>
                  </div>
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" className="stroke-zinc-800" strokeWidth="4" fill="transparent" />
                      <circle cx="32" cy="32" r="28" className="stroke-amber-500" strokeWidth="4" fill="transparent"
                        strokeDasharray={175.9}
                        strokeDashoffset={175.9 - (175.9 * stats.doneAfterDeadlinePercentage) / 100}
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white font-mono">{Math.round(stats.doneAfterDeadlinePercentage)}%</span>
                  </div>
                </div>

                {/* Ring 3: Not Completed */}
                <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Not Completed Yet</span>
                    <h3 className="text-3xl font-extrabold text-red-400">{stats.notCompletedCount}</h3>
                    <p className="text-xs text-zinc-500">pending tasks</p>
                  </div>
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="28" className="stroke-zinc-800" strokeWidth="4" fill="transparent" />
                      <circle cx="32" cy="32" r="28" className="stroke-red-500" strokeWidth="4" fill="transparent"
                        strokeDasharray={175.9}
                        strokeDashoffset={175.9 - (175.9 * stats.notCompletedPercentage) / 100}
                      />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white font-mono">{Math.round(stats.notCompletedPercentage)}%</span>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-zinc-900/80 border-b border-zinc-900">
                      <tr>
                        <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Task Title</th>
                        <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Assigned To</th>
                        <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deadline</th>
                        <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completed At</th>
                        <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Attachment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60">
                      {stats.taskHistory && stats.taskHistory.length > 0 ? (
                        stats.taskHistory.map((task) => {
                          const statusInfo = getTaskStatusInfo(task);
                          return (
                            <tr key={task.id} className="hover:bg-zinc-900/30 transition duration-150">
                              <td className="px-5 py-3.5">
                                <div className="font-semibold text-white text-sm">{task.title}</div>
                                <div className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{task.description}</div>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="text-sm text-zinc-300 font-medium">{task.assignedToName || 'N/A'}</div>
                                <div className="text-xs text-zinc-500 font-mono">{task.assignedToEmail}</div>
                              </td>
                              <td className="px-5 py-3.5 text-xs text-zinc-400 font-mono">
                                {formatDate(task.deadline)}
                              </td>
                              <td className="px-5 py-3.5 text-xs text-zinc-400 font-mono">
                                {formatDate(task.completedAt)}
                              </td>
                              <td className="px-5 py-3.5 whitespace-nowrap">
                                <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-full flex items-center gap-1.5 w-fit ${statusInfo.style}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                {task.fileName ? (
                                  <button
                                    onClick={() => downloadTaskAttachment(task.id, task.fileName)}
                                    className="px-2.5 py-1 text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 rounded-lg flex items-center gap-1 transition duration-150"
                                  >
                                    <span>📁</span> Download
                                  </button>
                                ) : (
                                  <span className="text-xs text-zinc-600 italic">None</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-5 py-12 text-center text-zinc-500 text-sm italic">
                            No tasks have been assigned by you yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-zinc-900 bg-zinc-900/40">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 hover:text-white transition duration-150 text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
