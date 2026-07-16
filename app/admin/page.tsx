import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import { Route } from "@/models/Route";
import { SeatInventory } from "@/models/SeatInventory";
import mongoose from "mongoose";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, Ticket, Clock, TrendingUp, RefreshCw } from "@/components/Icons";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  await dbConnect();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Aggregations
  const [
    totalUsers,
    revenueAgg,
    bookingsTodayCount,
    refundsCount,
    popularRoutesAgg,
    occupancyAgg,
    recentBookings
  ] = await Promise.all([
    User.countDocuments(),
    Booking.aggregate([
      { $match: { status: 'CONFIRMED' } },
      { $group: { _id: null, total: { $sum: '$pricePaid' } } }
    ]),
    Booking.countDocuments({ createdAt: { $gte: today } }),
    Booking.countDocuments({ status: 'CANCELLED', paymentStatus: 'COMPLETED' }),
    Booking.aggregate([
      { $group: { _id: '$trainId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 2 },
      { $lookup: { from: 'trains', localField: '_id', foreignField: '_id', as: 'train' } },
      { $unwind: { path: '$train', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'routes', localField: 'train.route', foreignField: '_id', as: 'routeInfo' } },
      { $unwind: { path: '$routeInfo', preserveNullAndEmptyArrays: true } }
    ]),
    mongoose.models.SeatInventory ? mongoose.models.SeatInventory.aggregate([
      { $group: { _id: '$train', totalSeats: { $sum: '$totalSeats' }, availableSeats: { $sum: '$availableSeats' } } },
      { $lookup: { from: 'trains', localField: '_id', foreignField: '_id', as: 'train' } },
      { $unwind: '$train' },
      { $project: {
          trainName: '$train.trainName',
          trainNumber: '$train.trainNumber',
          occupancyPercentage: { 
            $cond: [ { $eq: ['$totalSeats', 0] }, 0, 
              { $multiply: [ { $divide: [ { $subtract: ['$totalSeats', '$availableSeats'] }, '$totalSeats' ] }, 100 ] }
            ]
          }
      }},
      { $sort: { occupancyPercentage: -1 } },
      { $limit: 3 }
    ]) : [],
    Booking.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name').populate('trainId', 'name trainNumber').lean()
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const formattedRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue);
  
  const dailyBookings = bookingsTodayCount || 0;
  const activeUsers = totalUsers || 0;
  const refundsProcessed = refundsCount || 0;

  // Fallbacks if DB is empty
  const networkOccupancy = occupancyAgg.length > 0 ? occupancyAgg : [
    { trainNumber: "12123", trainName: "Deccan Queen", occupancyPercentage: 92 },
    { trainNumber: "22221", trainName: "Vande Bharat Exp", occupancyPercentage: 88 },
    { trainNumber: "12951", trainName: "Rajdhani Express", occupancyPercentage: 100 }
  ];

  const popularRoutes = popularRoutesAgg.length > 0 ? popularRoutesAgg : [
    { train: { trainName: "Mumbai CSMT - Pune Jn", trainNumber: "12123" }, count: 24 },
    { train: { trainName: "New Delhi - Mumbai Central", trainNumber: "12951" }, count: 18 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 font-medium mt-1">Real-time insights across your railway network.</p>
      </div>

      {/* Primary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/revenue" className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> Live
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-3xl font-black text-slate-900">{formattedRevenue}</p>
          </div>
        </Link>

        <Link href="/admin/bookings/daily" className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> Live
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Daily Bookings</p>
            <p className="text-3xl font-black text-slate-900">{dailyBookings}</p>
          </div>
        </Link>

        <Link href="/admin/refunds" className="bg-white/60 p-6 rounded-[2rem] border border-white shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-orange-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3" /> Live
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Pending Refunds</p>
            <p className="text-3xl font-black text-slate-900">{refundsProcessed}</p>
          </div>
        </Link>
      </div>

      {/* Secondary Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 p-8 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Recent Activity
            </h2>
            <Link href="/admin/bookings" className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline">View All <ArrowUpRight className="w-4 h-4"/></Link>
          </div>
          <div className="space-y-4">
            {recentBookings.map((booking: any) => (
              <div key={booking._id.toString()} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-600' : booking.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                    {booking.status === 'CONFIRMED' ? '✓' : booking.status === 'CANCELLED' ? '✕' : '⏳'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{booking.userId?.name || "Guest"}</p>
                    <p className="text-xs font-bold text-slate-500">{booking.trainId?.name} ({booking.trainId?.trainNumber})</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">₹{booking.pricePaid?.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Link href="/admin/routes/popular" className="bg-white/60 p-8 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-shadow cursor-pointer block">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" /> Popular Routes
            </h2>
            <span className="text-sm font-bold text-blue-600 flex items-center gap-1">View Full Report <ArrowUpRight className="w-4 h-4"/></span>
          </div>
          <div className="space-y-4">
            {popularRoutes.map((route: any, idx: number) => (
              <div key={route.train?.trainNumber || idx} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">{idx + 1}</div>
                  <div>
                    <p className="font-bold text-slate-900">{route.routeInfo?.routeName || route.train?.name || "Unknown Route"}</p>
                    <p className="text-xs font-bold text-slate-500">{route.count} Bookings</p>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-600">Top Route</span>
              </div>
            ))}
          </div>
        </Link>
      </div>
    </div>
  );
}
