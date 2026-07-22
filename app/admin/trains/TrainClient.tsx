"use client";

import { useState } from "react";
import { createTrain, deleteTrain } from "./actions";
import toast from "react-hot-toast";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CLASSES = ["1A", "2A", "3A", "SL", "CC", "GN"];

export default function TrainClient({ initialTrains, routes }: { initialTrains: any[], routes: any[] }) {
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [trainNumber, setTrainNumber] = useState("");
  const [trainName, setTrainName] = useState("");
  const [routeId, setRouteId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [basePrice, setBasePrice] = useState(1.5);
  
  const [runningDays, setRunningDays] = useState<number[]>([0,1,2,3,4,5,6]);
  
  const [coaches, setCoaches] = useState<{coachClass: string, capacity: number}[]>([
    { coachClass: "1A", capacity: 24 },
    { coachClass: "2A", capacity: 54 },
    { coachClass: "3A", capacity: 72 },
    { coachClass: "SL", capacity: 200 }
  ]);

  const toggleDay = (dayIndex: number) => {
    if (runningDays.includes(dayIndex)) {
      setRunningDays(runningDays.filter(d => d !== dayIndex));
    } else {
      setRunningDays([...runningDays, dayIndex]);
    }
  };

  const handleCoachChange = (index: number, capacity: string) => {
    const updated = [...coaches];
    updated[index].capacity = Number(capacity);
    setCoaches(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!trainNumber || !trainName || !routeId || !departureTime || runningDays.length === 0) {
      setError("Please fill all required fields and select at least one running day.");
      setLoading(false);
      return;
    }

    const res = await createTrain({
      trainNumber,
      name: trainName,
      route: routeId,
      departureTime,
      basePricePerKm: basePrice,
      runningDays,
      coaches: coaches.filter(c => c.capacity > 0)
    });

    if (res?.error) {
      toast.error(res.error);
    } else {
      setTrainNumber("");
      setTrainName("");
      setRouteId("");
      setDepartureTime("");
      toast.success("Success! Train has been deployed to the database.");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteTrain(id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Train deleted successfully");
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-8">
      {/* Create Form */}
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Add New Train</h2>
        {error && <div className="text-red-500 mb-4 font-medium text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Train Number</label>
              <input type="text" value={trainNumber} onChange={e => setTrainNumber(e.target.value)} required className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. 12125" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Train Name</label>
              <input type="text" value={trainName} onChange={e => setTrainName(e.target.value)} required className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="e.g. Pragati Express" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Route</label>
              <select value={routeId} onChange={e => setRouteId(e.target.value)} required className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900">
                <option value="">Select Route</option>
                {routes.map(r => (
                  <option key={r._id} value={r._id}>{r.routeName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Departure Time (HH:MM)</label>
              <input type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)} required className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Running Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day, idx) => (
                  <button 
                    key={day} 
                    type="button" 
                    onClick={() => toggleDay(idx)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                      runningDays.includes(idx) 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Base Price per Km (₹)</label>
              <input type="number" step="0.1" min="0.1" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} required className="w-full max-w-[200px] px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Coach Configuration (Capacity)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {coaches.map((coach, idx) => (
                <div key={coach.coachClass} className="bg-white p-3 rounded-2xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400 mb-1">{coach.coachClass} CLASS</div>
                  <input type="number" min="0" value={coach.capacity} onChange={e => handleCoachChange(idx, e.target.value)} className="w-full bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 font-medium text-sm focus:outline-none" />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full h-[50px] bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors">
            {loading ? "Saving Train..." : "Deploy Train"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden max-h-[calc(100vh-200px)] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Train</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Route</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Departure</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Classes</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialTrains.map((train) => (
              <tr key={train._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{train.name}</div>
                  <div className="text-sm font-medium text-slate-500">#{train.trainNumber}</div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-500">{train.route?.routeName || "N/A"}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{train.departureTime}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {train.coaches.map((c: any) => (
                      <span key={c.coachClass} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                        {c.coachClass} ({c.capacity})
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {confirmDeleteId === train._id ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-red-600 font-bold mr-1">Sure?</span>
                      <button onClick={() => handleDelete(train._id)} className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">Yes</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(train._id)} className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {initialTrains.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">No trains found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
