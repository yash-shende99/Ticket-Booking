"use client";

import { useState } from "react";

export default function BookingClient({ initialBookings }: { initialBookings: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = initialBookings.filter(b => 
    b.pnr.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.train.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <input 
          type="text" 
          placeholder="Search by PNR, Passenger, or Train..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-96 px-4 py-3 rounded-2xl bg-white border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
        />
        <div className="text-sm font-bold text-slate-500 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
          Total: {filteredBookings.length}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">PNR</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Train</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Journey</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-black text-slate-900">{booking.pnr}</div>
                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{booking.passengers} Passenger(s)</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{booking.user.name}</div>
                    <div className="text-xs font-medium text-slate-500">{booking.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{booking.train.name}</div>
                    <div className="text-xs font-medium text-slate-500">#{booking.train.trainNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">
                      {new Date(booking.journeyDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-xs font-bold text-slate-500 mt-0.5">Class: {booking.seatClass}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${
                      booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    ₹{booking.totalFare.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No bookings found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
