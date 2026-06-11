import { useState, useEffect } from "react";
import { getUserLoginHistory } from "../services/loginHistoryService.js";

export default function EmployeeLoginHistoryModal({ isOpen, onClose, employee }) {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Reset page when employee changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setPage(0);
    }
  }, [isOpen, employee?.id]);

  // Fetch paginated history when active
  useEffect(() => {
    if (isOpen && employee?.id) {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          setError("");
          const response = await getUserLoginHistory(employee.id, page, 10);
          setLoginHistory(response.content || []);
          setTotalPages(response.totalPages || 0);
        } catch (error) {
          console.error("Failed to fetch employee login history:", error);
          setError("Failed to load login history");
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, employee?.id, page]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getEventTypeIcon = (eventType) => {
    return eventType === 'LOGIN' ? '🟢' : '🔴';
  };

  const getEventTypeLabel = (eventType) => {
    return eventType === 'LOGIN' ? 'Login' : 'Logout';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl transform scale-100 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-900/40">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-green-500">📊</span> Login History
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              {employee?.name || 'N/A'} ({employee?.email})
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

        {/* Content */}
        <div className="p-6">
          {/* Error State */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setPage(page)}
                className="mt-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-zinc-500">Loading history...</p>
              </div>
            </div>
          ) : (
            /* Login History Table */
            <div className="bg-zinc-900/40 border border-zinc-905 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-zinc-900/80 border-b border-zinc-900">
                    <tr>
                      <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Event Type
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {loginHistory.length > 0 ? (
                      loginHistory.map((login) => (
                        <tr key={login.id} className="hover:bg-zinc-900/30 transition duration-150">
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span>{getEventTypeIcon(login.eventType)}</span>
                              <span className={`text-sm font-semibold ${
                                login.eventType === 'LOGIN' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {getEventTypeLabel(login.eventType)}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-sm text-zinc-300 font-mono">
                            {formatDate(login.eventTime)}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                              login.eventType === 'LOGIN' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {login.eventType === 'LOGIN' ? 'Success' : 'Logged Out'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-5 py-12 text-center text-zinc-500 text-sm italic">
                          No login history found for this user
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-4 border-t border-zinc-900 bg-zinc-900/20 flex items-center justify-between">
                  <div className="text-xs text-zinc-400">
                    Page <span className="font-semibold text-white">{page + 1}</span> of <span className="font-semibold text-white">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition duration-150"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition duration-150"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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
