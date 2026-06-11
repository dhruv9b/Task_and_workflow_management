import { useEffect, useState } from "react";
import { getUsers } from "../services/userService";
import { updateUserStatus, deleteUser, assignManager } from "../services/adminService";
import EmployeeLoginHistoryModal from "../components/EmployeeLoginHistoryModal.jsx";

export default function UsersTable({ onDataChange }) {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedManager, setSelectedManager] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    const res = await getUsers(page, 5);
    setUsers(res.data.content);
    setTotalPages(res.data.totalPages);
  };

  const toggleStatus = async (id, active) => {
    try {
      await updateUserStatus(id, { active: !active });
      
      // Update local state immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, active: !user.active } : user
        )
      );
      
      setSuccess(`User ${!active ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
      
      // Notify parent component
      if (onDataChange) onDataChange();
    } catch (error) {
      const errorMessage = error.response?.data || error.message || "Status update failed";
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteUser(id);
        
        // Update local state immediately
        setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        
        setSuccess("User deleted successfully!");
        setTimeout(() => setSuccess(""), 3000);
        
        // Notify parent component
        if (onDataChange) onDataChange();
      } catch (error) {
        const errorMessage = error.response?.data || error.message || "Delete failed";
        setError(errorMessage);
        setTimeout(() => setError(""), 5000);
      }
    }
  };

  const handleAssignManager = async (userId) => {
    const managerId = selectedManager[userId];
    if (!managerId) {
      setError("Please enter a manager ID");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      await assignManager(userId, managerId);
      
      // Update local state immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, managerId: parseInt(managerId) } : user
        )
      );
      
      setSuccess("Manager assigned successfully!");
      setTimeout(() => setSuccess(""), 3000);
      setSelectedManager({ ...selectedManager, [userId]: "" });
      
      // Notify parent component
      if (onDataChange) onDataChange();
    } catch (error) {
      const errorMessage = error.response?.data || error.message || "Assignment failed";
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 text-white">Users</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-zinc-400 border-b border-zinc-700">
            <tr>
              <th className="py-3 text-left">ID</th>
              <th className="py-3 text-left">Name</th>
              <th className="py-3 text-left">Email</th>
              <th className="py-3">Role</th>
              <th className="py-3">Manager ID</th>
              <th className="py-3">Status</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-zinc-800 hover:bg-zinc-800/60 transition"
              >
                <td className="py-3">
                  <span className="text-zinc-300 font-mono text-xs bg-zinc-800 px-2 py-1 rounded">
                    #{u.id}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                      <span className="text-zinc-300 font-medium">
                        {u.name || 'N/A'}
                      </span>
                      {u.role === "EMPLOYEE" && u.doneBeforeDeadlinePercentage !== undefined && u.doneBeforeDeadlinePercentage !== null && (
                        <div className="mt-0.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.doneBeforeDeadlinePercentage === -1.0
                              ? 'bg-zinc-800 text-zinc-500 border border-zinc-750'
                              : 'bg-green-600/20 text-green-400 border border-green-600/30'
                          }`}>
                            🎯 Done before deadline: {u.doneBeforeDeadlinePercentage === -1.0 ? 'N/A' : `${Math.round(u.doneBeforeDeadlinePercentage)}%`}
                          </span>
                        </div>
                      )}
                      {u.name && (
                        <span className="text-xs text-zinc-500 mt-0.5">Display name</span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedUserForHistory(u)}
                      className="px-2 py-1 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-600/30 text-[10px] font-medium transition-all transform hover:scale-105 flex items-center gap-1"
                      title="View Login History"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      History
                    </button>
                  </div>
                </td>
                <td className="py-3">{u.email}</td>
                <td className="py-3 text-center">{u.role}</td>
                
                <td className="py-3 text-center">
                  {u.role === "EMPLOYEE" ? (
                    u.managerId ? (
                      <span className="text-zinc-300 font-mono text-xs bg-blue-600/20 px-2 py-1 rounded border border-blue-600/30">
                        #{u.managerId}
                      </span>
                    ) : (
                      <span className="text-zinc-500 text-xs italic">No Manager</span>
                    )
                  ) : (
                    <span className="text-zinc-600 text-xs">-</span>
                  )}
                </td>

                <td className="py-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                      ${u.active ? "bg-green-600/20 text-green-400" : "bg-red-600/20 text-red-400"}
                    `}
                  >
                    {u.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="py-3">
                  <div className="flex flex-col items-end gap-2">
                    {/* Primary Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(u.id, u.active)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all transform hover:scale-105 ${
                          u.active 
                            ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30" 
                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                        }`}
                      >
                        {u.active ? (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd"/>
                            </svg>
                            Deactivate
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                            </svg>
                            Activate
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(u.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30 text-xs font-medium transition-all transform hover:scale-105 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                        Delete
                      </button>

                      <button
                        onClick={() => setSelectedUserForHistory(u)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-600/30 text-xs font-medium transition-all transform hover:scale-105 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        History
                      </button>
                    </div>

                    {/* Manager Assignment for Employees */}
                    {u.role === "EMPLOYEE" && (
                      <div className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded-lg border border-zinc-700">
                        <input
                          type="number"
                          placeholder="Manager ID"
                          className="w-24 px-2 py-1.5 rounded-md bg-zinc-900 border border-zinc-600 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={selectedManager[u.id] || ""}
                          onChange={(e) =>
                            setSelectedManager({
                              ...selectedManager,
                              [u.id]: e.target.value,
                            })
                          }
                        />
                        <button
                          onClick={() => handleAssignManager(u.id)}
                          className="px-3 py-1.5 rounded-md bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30 text-xs font-medium transition-all transform hover:scale-105 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                          </svg>
                          Assign
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-5 text-sm text-zinc-400">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-4 py-1 rounded-md bg-zinc-800 disabled:opacity-40"
        >
          Prev
        </button>

        <span>
          Page {page + 1} of {totalPages}
        </span>

        <button
          disabled={page + 1 === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-1 rounded-md bg-zinc-800 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <EmployeeLoginHistoryModal
        isOpen={selectedUserForHistory !== null}
        onClose={() => setSelectedUserForHistory(null)}
        employee={selectedUserForHistory}
      />
    </div>
  );
}
