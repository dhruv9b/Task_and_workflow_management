import { useState } from "react";
import { assignTask } from "../services/taskService";
import { useWebSocket } from "../context/WebSocketContext";

export default function AssignTaskModal({ isOpen, onClose, employee, onTaskAssigned }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { publishTaskUpdate } = useWebSocket();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !deadlineDate || !deadlineTime) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Construct ISO string: YYYY-MM-DDTHH:MM:SS
      const formattedDeadline = `${deadlineDate}T${deadlineTime}:00`;

      await assignTask(employee.id, title, description, formattedDeadline, file, publishTaskUpdate);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle("");
        setDescription("");
        setDeadlineDate("");
        setDeadlineTime("");
        setFile(null);
        if (onTaskAssigned) onTaskAssigned();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to assign task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl transform scale-100 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 bg-zinc-900/40">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-green-500">📋</span> Assign Task
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              To: {employee?.name || employee?.email}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-xs font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-green-400 text-xs font-semibold">✨ Task assigned successfully!</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Task Title</label>
            <input
              type="text"
              required
              disabled={loading || success}
              placeholder="e.g. Complete Q2 Financial Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
            <textarea
              required
              disabled={loading || success}
              rows={3}
              placeholder="Provide clear steps or instructions for the employee..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deadline Date</label>
              <input
                type="date"
                required
                disabled={loading || success}
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deadline Time</label>
              <input
                type="time"
                required
                disabled={loading || success}
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Upload Attachment (File)</label>
            <div className="relative group border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl bg-zinc-900/20 p-4 transition duration-150 flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                disabled={loading || success}
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-2xl mb-1">📁</span>
              <span className="text-xs text-zinc-400 font-semibold group-hover:text-zinc-300">
                {file ? file.name : "Select or drag file here"}
              </span>
              <span className="text-[10px] text-zinc-500 mt-1">Accepts any document, spreadsheet, pdf or image</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || success}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800 hover:text-white transition duration-150 text-sm font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-black transition duration-150 text-sm font-bold flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Assigning...
                </>
              ) : (
                "Assign Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
