import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import mongoose from "mongoose";
import Pagination from "@/components/Pagination";

export const dynamic = 'force-dynamic';

export default async function PopularRoutesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") redirect("/admin/login");

  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams.page) || 1;
  const itemsPerPage = 15;

  await dbConnect();
  
  if (!mongoose.models.Train) mongoose.model('Train', Train.schema);

  const popularRoutes = await Booking.aggregate([
    { $match: { status: 'CONFIRMED' } },
    { $group: { _id: '$trainId', count: { $sum: 1 }, revenue: { $sum: '$pricePaid' } } },
    { $sort: { count: -1 } },
    { $lookup: { from: 'trains', localField: '_id', foreignField: '_id', as: 'train' } },
    { $unwind: { path: '$train', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'routes', localField: 'train.route', foreignField: '_id', as: 'route' } },
    { $unwind: { path: '$route', preserveNullAndEmptyArrays: true } }
  ]);

  const totalPages = Math.ceil(popularRoutes.length / itemsPerPage);
  const displayRoutes = popularRoutes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Popular Routes</h1>
        <p className="text-slate-500 font-medium mt-1">Discover your highest performing train sectors by volume.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Route / Sector</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Total Bookings</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Route Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRoutes.map((route: any, idx: number) => (
                <tr key={route._id.toString()} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-400">#{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{route.route?.routeName || route.train?.name || "Unknown Route"}</div>
                    <div className="text-xs font-medium text-slate-500">{route.train?.name} · Train No. {route.train?.trainNumber || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm">
                      {route.count} Tickets
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600">
                    ₹{route.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              {displayRoutes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">No active routes data.</td>
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
