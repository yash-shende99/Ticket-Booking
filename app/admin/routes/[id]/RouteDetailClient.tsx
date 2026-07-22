"use client";

import { useState } from "react";
import { updateRoute } from "../actions";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RouteDetailClient({ route, stations }: { route: any, stations: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [routeName, setRouteName] = useState(route.routeName);
  
  // Format stations from server to state structure
  const [routeStations, setRouteStations] = useState<{station: string, distance: number, halt: number, dayOffset: number}[]>(
    route.stations.map((s: any) => ({
      station: s.station._id ? s.station._id.toString() : s.station.toString(),
      distance: s.distanceFromSource,
      halt: s.haltDuration,
      dayOffset: s.dayOffset
    }))
  );

  const handleAddStation = () => {
    setRouteStations([...routeStations, { station: "", distance: 0, halt: 0, dayOffset: 0 }]);
  };

  const handleRemoveStation = (index: number) => {
    const updated = [...routeStations];
    updated.splice(index, 1);
    setRouteStations(updated);
  };

  const handleStationChange = (index: number, field: string, value: any) => {
    const updated = [...routeStations];
    (updated[index] as any)[field] = value;
    setRouteStations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!routeName || routeStations.length < 2) {
      toast.error("Please fill all required fields and ensure at least 2 stations exist.");
      setLoading(false);
      return;
    }

    if (!routeStations[0].station || !routeStations[routeStations.length - 1].station) {
      toast.error("Source and Destination stations must be selected.");
      setLoading(false);
      return;
    }

    const payload = {
      routeName,
      source: routeStations[0].station,
      destination: routeStations[routeStations.length - 1].station,
      stations: routeStations.map(s => ({
        station: s.station,
        distanceFromSource: Number(s.distance),
        haltDuration: Number(s.halt),
        dayOffset: Number(s.dayOffset)
      }))
    };

    const res = await updateRoute(route._id, payload);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Route updated successfully!");
      router.push("/admin/routes");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 mb-6">Edit Route: {route.routeName}</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Route Name</label>
          <input 
            type="text" 
            value={routeName} 
            onChange={e => setRouteName(e.target.value)}
            placeholder="e.g. Mumbai to Delhi Rajdhani Route" 
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900" 
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase">Stations on Route (Order is important)</label>
            <button type="button" onClick={handleAddStation} className="text-blue-600 font-bold text-xs hover:underline">
              + Add Station
            </button>
          </div>
          
          <div className="space-y-3">
            {routeStations.map((stop, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="col-span-12 font-bold text-slate-400 text-xs uppercase">
                  {index === 0 ? "Source Station" : index === routeStations.length - 1 ? "Destination Station" : `Stop ${index}`}
                </div>
                
                <div className="col-span-12 md:col-span-4">
                  <select 
                    value={stop.station} 
                    onChange={e => handleStationChange(index, 'station', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Select Station</option>
                    {stations.map(st => (
                      <option key={st._id} value={st._id}>{st.name} ({st.code})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <input 
                    type="number" 
                    value={stop.distance} 
                    onChange={e => handleStationChange(index, 'distance', e.target.value)}
                    placeholder="Dist from Source (km)" 
                    disabled={index === 0}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-bold px-1">Km from Source</span>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <input 
                    type="number" 
                    value={stop.halt} 
                    onChange={e => handleStationChange(index, 'halt', e.target.value)}
                    placeholder="Halt (mins)" 
                    disabled={index === 0 || index === routeStations.length - 1}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-bold px-1">Halt (mins)</span>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <input 
                    type="number" 
                    value={stop.dayOffset} 
                    onChange={e => handleStationChange(index, 'dayOffset', e.target.value)}
                    placeholder="Day Offset" 
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 font-bold px-1">Day Offset (0, 1, 2)</span>
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
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={() => router.push("/admin/routes")} className="w-1/3 h-[50px] bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="w-2/3 h-[50px] bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">
            {loading ? "Updating..." : "Save Route Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
