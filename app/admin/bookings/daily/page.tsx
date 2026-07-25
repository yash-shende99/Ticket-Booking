import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import { User } from "@/models/User";
import mongoose from "mongoose";
import Pagination from "@/components/Pagination";

export const dynamic = 'force-dynamic';

export default async function DailyBookingsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") redirect("/admin/login");

  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const itemsPerPage = 15;

  await dbConnect();
  
  if (!mongoose.models.Train) mongoose.model('Train', Train.schema);
  if (!mongoose.models.User) mongoose.model('User', User.schema);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyBookings = await Booking.find({ createdAt: { $gte: today } })
    .populate("userId", "name email")
    .populate("trainId", "trainNumber name")
    .sort({ createdAt: -1 })
    .lean();
    
  const totalPages = Math.ceil(dailyBookings.length / itemsPerPage);
  const displayBookings = dailyBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Today's Bookings</h1>
        <p className="text-slate-500 font-medium mt-1">Live feed of all tickets booked since midnight.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">PNR</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Passenger</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Train</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Fare</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayBookings.map((booking: any) => (
                <tr key={booking._id.toString()} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-500">
                    {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900">{booking.pnr}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{booking.userId?.name || 'Guest'}</div>
                    <div className="text-xs font-medium text-slate-500">{booking.userId?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{booking.trainId?.name || 'Unknown'}</div>
                    <div className="text-xs font-medium text-slate-500">#{booking.trainId?.trainNumber || 'N/A'}</div>
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
                    ₹{booking.pricePaid?.toLocaleString('en-IN') || 0}
                  </td>
                </tr>
              ))}
              {displayBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">No bookings recorded today yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
