"use client";

import { useState } from "react";
import { createNotification, deleteNotification } from "./actions";
import { AlertCircle, Bell, Info } from "lucide-react";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";

export default function NotificationClient({ initialNotifications }: { initialNotifications: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const displayNotifications = notifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");
  
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await createNotification({ title, message, type });

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Notification blasted successfully!");
      setTitle("");
      setMessage("");
      setType("INFO");
      window.location.reload();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(notifications.filter(n => n._id !== id));
    toast.success("Notification deleted");
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-8">
      {/* Create New Notification Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-6">Blast New Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. System Maintenance" 
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Type</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900" 
              >
                <option value="INFO">Information (Blue)</option>
                <option value="ALERT">Alert (Red)</option>
                <option value="PROMO">Promo (Purple)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Message</label>
            <textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter the announcement details..." 
              required
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" 
            />
          </div>
          <div className="flex justify-end mt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              {loading ? "Sending..." : "Send Announcement"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Notifications */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-500 uppercase tracking-wider text-sm px-2">Active Announcements</h3>
        {displayNotifications.length === 0 && (
          <div className="text-center py-12 text-slate-500 font-medium bg-white rounded-3xl border border-slate-200 shadow-sm">
            No active announcements.
          </div>
        )}
        {displayNotifications.map((notif: any) => (
          <div key={notif._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-2xl ${
              notif.type === 'ALERT' ? 'bg-red-50 text-red-600' :
              notif.type === 'PROMO' ? 'bg-purple-50 text-purple-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              {notif.type === 'ALERT' ? <AlertCircle className="w-6 h-6" /> :
               notif.type === 'PROMO' ? <Bell className="w-6 h-6" /> :
               <Info className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-slate-900 text-lg">{notif.title}</h4>
                  <div className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    {new Date(notif.createdAt).toLocaleDateString()} • {notif.type}
                  </div>
                </div>
                {confirmDeleteId === notif._id ? (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-red-600 font-bold mr-1">Sure?</span>
                    <button onClick={() => handleDelete(notif._id)} className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">Yes</button>
                    <button onClick={() => setConfirmDeleteId(null)} className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors">No</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDeleteId(notif._id)}
                    className="text-slate-400 hover:text-red-500 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-slate-600 mt-2 font-medium leading-relaxed">{notif.message}</p>
            </div>
          </div>
        ))}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
