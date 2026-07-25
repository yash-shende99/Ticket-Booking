"use client";

import { useState } from "react";
import { updateUserRole, deleteUser } from "./actions";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";

export default function UserClient({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading(userId);
    const res = await updateUserRole(userId, newRole);
    if (res?.error) {
      toast.error(res.error);
    } else {
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success("Role updated!");
    }
    setLoading(null);
  };

  const handleDelete = async (userId: string) => {
    setLoading(userId);
    const res = await deleteUser(userId);
    if (res?.error) {
      toast.error(res.error);
      setLoading(null);
    } else {
      setUsers(users.filter(u => u._id !== userId));
      toast.success("User deleted successfully");
    }
    setConfirmDeleteId(null);
  };

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const displayUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Bookings</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayUsers.map((user) => (
              <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-sm font-medium text-slate-500">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={loading === user._id}
                    className={`text-sm font-bold px-3 py-1.5 rounded-lg border focus:outline-none ${
                      user.role === 'admin' 
                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">{user.totalBookings}</td>
                <td className="px-6 py-4 font-medium text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  {confirmDeleteId === user._id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-red-600 font-bold mr-1">Sure?</span>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        disabled={loading === user._id}
                        className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        {loading === user._id ? "..." : "Yes"}
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={loading === user._id}
                        className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(user._id)} 
                      disabled={loading === user._id}
                      className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {displayUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
