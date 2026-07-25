"use client";

import { useState } from "react";
import Link from "next/link";
import { createRoute, deleteRoute } from "./actions";
import toast from "react-hot-toast";
import Pagination from "@/components/Pagination";

export default function RouteClient({ initialRoutes, stations }: { initialRoutes: any[], stations: any[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [routes, setRoutes] = useState(initialRoutes);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  const totalPages = Math.ceil(routes.length / itemsPerPage);
  const displayRoutes = routes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  const [routeName, setRouteName] = useState("");
  const [routeStations, setRouteStations] = useState<{station: string, distance: number, halt: number, dayOffset: number}[]>([
    { station: "", distance: 0, halt: 0, dayOffset: 0 },
    { station: "", distance: 0, halt: 0, dayOffset: 0 }
  ]);

  const handleAddStation = () => {
    setRouteStations([...routeStations, { station: "", distance: 0, halt: 0, dayOffset: 0 }]);
  };

  const handleRemoveStation = (index: number) => {
    if (routeStations.length <= 2) return;
    const updated = [...routeStations];
    updated.splice(index, 1);
    setRouteStations(updated);
  };

  const handleStationChange = (index: number, field: string, value: string | number) => {
    const updated = [...routeStations];
    (updated[index] as any)[field] = value;
    setRouteStations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate
    if (!routeName) { toast.error("Route name is required"); setLoading(false); return; }
    if (routeStations.some(rs => !rs.station)) { toast.error("All station stops must have a station selected"); setLoading(false); return; }
    
    const source = routeStations[0].station;
    const destination = routeStations[routeStations.length - 1].station;
    
    const formattedStations = routeStations.map(rs => ({
      station: rs.station,
      distanceFromSource: Number(rs.distance),
      haltDuration: Number(rs.halt),
      dayOffset: Number(rs.dayOffset)
    }));

    const res = await createRoute({
      routeName,
      source,
      destination,
      stations: formattedStations
    });

    if (res?.error) {
      toast.error(res.error);
    } else {
      setRouteName("");
      setRouteStations([
        { station: "", distance: 0, halt: 0, dayOffset: 0 },
        { station: "", distance: 0, halt: 0, dayOffset: 0 }
      ]);
      toast.success("Route created successfully!");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteRoute(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      setRoutes(routes.filter((r: any) => r._id !== id));
      toast.success("Route deleted successfully");
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4">
      {/* Create Form */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Build New Route</h2>
        {error && <div className="text-red-500 mb-4 font-medium text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Route Name</label>
            <input 
              type="text" 
              value={routeName}
              onChange={e => setRouteName(e.target.value)}
              required 
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" 
              placeholder="e.g. Pune - Mumbai Central Line" 
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 uppercase">Station Sequence</label>
              <button type="button" onClick={handleAddStation} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                + Add Stop
              </button>
            </div>
            
            {routeStations.map((rs, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative">
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    {index === 0 ? "Source Station" : index === routeStations.length - 1 ? "Destination Station" : `Stop ${index}`}
                  </label>
                  <select 
                    value={rs.station}
                    onChange={e => handleStationChange(index, "station", e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm focus:outline-none"
                  >
                    <option value="">Select Station</option>
                    {stations.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dist (km)</label>
                  <input type="number" min="0" value={rs.distance} onChange={e => handleStationChange(index, "distance", e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm focus:outline-none" />
                </div>
                
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Halt (mins)</label>
                  <input type="number" min="0" value={rs.halt} onChange={e => handleStationChange(index, "halt", e.target.value)} disabled={index===0 || index===routeStations.length-1} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm focus:outline-none disabled:opacity-50" />
                </div>

                <div className="col-span-4 md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Day Offset</label>
                  <input type="number" min="0" value={rs.dayOffset} onChange={e => handleStationChange(index, "dayOffset", e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-sm focus:outline-none" />
                </div>

                {routeStations.length > 2 && (
                  <div className="col-span-12 md:col-span-2 flex justify-end">
                    <button type="button" onClick={() => handleRemoveStation(index)} className="text-red-500 hover:text-red-700 font-bold text-xs bg-red-50 px-3 py-2 rounded-lg">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="w-full h-[50px] bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">
            {loading ? "Saving Route..." : "Create Route"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Route Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Source</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Destination</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Stops</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayRoutes.map((route: any) => (
              <tr key={route._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{route.routeName}</td>
                <td className="px-6 py-4 font-medium text-slate-500">{route.source?.name} ({route.source?.code})</td>
                <td className="px-6 py-4 font-medium text-slate-500">{route.destination?.name} ({route.destination?.code})</td>
                <td className="px-6 py-4 font-medium text-slate-500">{route.stations.length}</td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <Link href={`/admin/routes/${route._id}`} className="text-blue-500 hover:text-blue-700 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                    View / Edit
                  </Link>
                  {confirmDeleteId === route._id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-red-600 font-bold mr-1">Sure?</span>
                      <button onClick={() => handleDelete(route._id)} className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(route._id)} className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {displayRoutes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No routes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
