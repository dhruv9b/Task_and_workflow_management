import { useEffect, useState } from "react";
import {
  createAnnouncement,
  getManagerAnnouncements,
} from "../services/managerService";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../context/WebSocketContext";

export default function ManagerAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { connected, setAnnouncementCallback, publishAnnouncement } = useWebSocket();

  const loadAnnouncements = async () => {
    try {
      const res = await getManagerAnnouncements();
      setAnnouncements(res.data);
    } catch (error) {
      console.error("Failed to load manager announcements:", error);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Set up WebSocket callback for real-time updates
  useEffect(() => {
    if (connected) {
      setAnnouncementCallback((data) => {
        console.log('WebSocket announcement update received:', data);
        if (data) {
          loadAnnouncements();
        }
      });
    }
  }, [connected, setAnnouncementCallback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Optimistic update - add announcement immediately
      const newAnnouncement = {
        id: Date.now(), // Temporary ID
        title,
        message,
        createdAt: new Date().toISOString(),
      };
      
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      
      // Backend call
      await createAnnouncement({ title, message });
      
      // Publish via WebSocket for real-time updates
      publishAnnouncement({
        type: 'ANNOUNCEMENT_CREATED',
        title,
        message,
        createdAt: new Date().toISOString(),
      });
      
      // Refresh to get real data with proper ID
      await loadAnnouncements();
      
      setSuccess("Announcement posted successfully!");
      setTimeout(() => setSuccess(""), 3000);
      
      // Clear form
      setTitle("");
      setMessage("");
    } catch (error) {
      // Rollback on error
      setAnnouncements(prev => prev.filter(a => a.id !== newAnnouncement.id));
      setError("Failed to post announcement. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Announcements</h1>
            <p className="text-sm text-gray-400">
              Create and manage announcements for your team
            </p>
          </div>
          <button
            onClick={() => navigate("/manager")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Create Announcement Card */}
        <div className="rounded-xl bg-gray-900 p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-medium">Create Announcement</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full rounded-lg bg-black border border-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />

            <textarea
              rows={4}
              className="w-full rounded-lg bg-black border border-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-black hover:bg-green-500 disabled:opacity-60"
            >
              {loading ? "Posting..." : "Post Announcement"}
            </button>
          </form>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Previous Announcements</h2>

          {announcements.length === 0 && (
            <p className="text-sm text-gray-400">
              No announcements yet
            </p>
          )}

          {announcements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl bg-gray-900 p-5 shadow"
            >
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-base font-semibold">{a.title}</h4>
                <span className="text-xs text-gray-500">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-sm text-gray-300">{a.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

