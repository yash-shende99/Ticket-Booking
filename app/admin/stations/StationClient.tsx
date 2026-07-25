"use client";

import { useState } from "react";
import { createStation, deleteStation } from "./actions";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";

export default function StationClient({ initialStations }: { initialStations: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [stations, setStations] = useState(initialStations);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const totalPages = Math.ceil(stations.length / itemsPerPage);
  const displayStations = stations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await createStation(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      (e.target as HTMLFormElement).reset();
      toast.success("Station added successfully! Refresh to see.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteStation(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      setStations(stations.filter((s: any) => s._id !== id));
      toast.success("Station deleted successfully");
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4">
      {/* Create Form */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Station</h2>
        {error && <div className="text-red-500 mb-4 font-medium text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Station Name</label>
            <input type="text" name="name" required className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. Pune Junction" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Code</label>
            <input type="text" name="code" required className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium uppercase focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="PUNE" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">City</label>
            <input type="text" name="city" required className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Pune" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">State</label>
            <input type="text" name="state" required className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Maharashtra" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" disabled={loading} className="w-full h-[50px] bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">
              {loading ? "Adding..." : "Add Station"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Code</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">City / State</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayStations.map((station: any) => (
              <tr key={station._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-black text-sm tracking-wider">
                    {station.code}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">{station.name}</td>
                <td className="px-6 py-4 font-medium text-slate-500">{station.city}, {station.state}</td>
                <td className="px-6 py-4 text-right">
                  {confirmDeleteId === station._id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-red-600 font-bold mr-1">Sure?</span>
                      <button onClick={() => handleDelete(station._id)} className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(station._id)} className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {displayStations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No stations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
