import { useEffect, useState, useCallback } from "react";
import { getUserAnnouncements } from "../services/employeeService";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../context/WebSocketContext";

export default function UserAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { connected, setAnnouncementCallback } = useWebSocket();

  const loadAnnouncements = useCallback(async () => {
    try {
      const res = await getUserAnnouncements();
      const newAnnouncements = res.data;
      
      // Check if there are new announcements
      setAnnouncements(prev => {
        if (prev.length === 0 || newAnnouncements.length > prev.length) {
          setLastUpdate(Date.now());
        }
        return newAnnouncements;
      });
      setError("");
    } catch (error) {
      console.error("Failed to load announcements:", error);
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // Set up WebSocket callback for real-time updates
  const handleAnnouncementUpdate = useCallback((data) => {
    console.log('WebSocket announcement update received:', data);
    if (data) {
      loadAnnouncements();
    }
  }, [loadAnnouncements]);

  useEffect(() => {
    if (connected) {
      setAnnouncementCallback(handleAnnouncementUpdate);
    }
  }, [connected, setAnnouncementCallback, handleAnnouncementUpdate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">
        Loading announcements...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Team Announcements
            </h1>
            <p className="text-sm text-gray-400">
              Important updates from your manager
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${Date.now() - lastUpdate < 2000 ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
              Auto-refresh enabled
            </div>
            <button
              onClick={loadAnnouncements}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => navigate("/employees")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {announcements.length === 0 && !error && (
          <div className="rounded-xl bg-gray-900 p-6 text-center text-gray-400">
            No announcements yet
          </div>
        )}

        {/* Announcements */}
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl bg-gray-900 p-5 shadow"
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-base font-semibold">
                  {a.title}
                </h4>
                <span className="text-xs text-gray-500">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-gray-300">
                {a.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

