import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { updateForcePasswordChange } = useAuth();

  const isPasswordValid = newPassword.length >= 8;

  const submit = async () => {
    if (!oldPassword || !newPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      // Update force password change flag in localStorage
      updateForcePasswordChange(false);
      navigate("/");
    } catch (err) {
      setError("Failed to update password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/account-settings")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Account Settings
          </button>
          <div>
            <h1 className="text-2xl font-bold text-green-500">Change Password</h1>
            <p className="text-sm text-zinc-400 mt-1">Update your account password</p>
          </div>
        </div>
      </header>
      
      <div className="flex items-center justify-center px-4 py-12">
        
        {/* Card */}
        <div className="w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-xl">
          
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-white">
              Change Your Password
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              You must update your password to continue
            </p>
          </div>

        {/* Form */}
        <div className="space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {/* Old Password */}
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="mb-1 block text-sm text-gray-400">
              New Password
            </label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 ${
                newPassword && !isPasswordValid 
                  ? "border-red-500 bg-red-500/10" 
                  : "border-gray-700 bg-gray-800 focus:border-green-500"
              }`}
            />
            
            {/* Password validation hint */}
            <p
              className={`mt-1 text-xs ${
                isPasswordValid ? "text-green-500" : "text-zinc-400"
              }`}
            >
              Must be at least 8 characters
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading || !isPasswordValid || !oldPassword}
            className="mt-2 w-full rounded-lg bg-green-600 py-2 font-medium text-black hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

