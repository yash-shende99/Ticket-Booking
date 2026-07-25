import dbConnect from "@/lib/db";
import Link from "next/link";
import TrainSearch from "@/components/TrainSearch";
import HomePageSections from "@/components/HomePageSections";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import { Route } from "@/models/Route";
import { Station } from "@/models/Station";
import { Coupon } from "@/models/Coupon";
import mongoose from "mongoose";

export const revalidate = 60; // Revalidate every 60 seconds on Vercel


export default async function Home() {
  await dbConnect();
  
  // Ensure models are registered for aggregation lookups
  if (!mongoose.models.Train) mongoose.model('Train', Train.schema);
  if (!mongoose.models.Route) mongoose.model('Route', Route.schema);

  // Fetch TOP 4 popular routes by actual booking count (same as admin dashboard)
  const popularRoutesAgg = await Booking.aggregate([
    { $match: { status: 'CONFIRMED' } },
    { $group: { _id: '$trainId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 4 },
    { $lookup: { from: 'trains', localField: '_id', foreignField: '_id', as: 'train' } },
    { $unwind: { path: '$train', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'routes', localField: 'train.route', foreignField: '_id', as: 'route' } },
    { $unwind: { path: '$route', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'stations', localField: 'route.source', foreignField: '_id', as: 'source' } },
    { $unwind: { path: '$source', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'stations', localField: 'route.destination', foreignField: '_id', as: 'destination' } },
    { $unwind: { path: '$destination', preserveNullAndEmptyArrays: true } },
  ]);

  const popularRoutes = popularRoutesAgg.length > 0
    ? popularRoutesAgg.map((r: any) => ({
        name: r.source?.name && r.destination?.name
          ? `${r.source.name} → ${r.destination.name}`
          : r.train?.name || 'Popular Route',
        sourceId: r.source?._id?.toString() || '',
        destId: r.destination?._id?.toString() || '',
        bookings: r.count,
      }))
    : [
        { name: 'Delhi → Mumbai', sourceId: '', destId: '', bookings: 0 },
        { name: 'Bangalore → Chennai', sourceId: '', destId: '', bookings: 0 },
        { name: 'Mumbai → Pune', sourceId: '', destId: '', bookings: 0 },
        { name: 'Kolkata → Patna', sourceId: '', destId: '', bookings: 0 },
      ];

  // Fetch active coupons
  const activeCouponsRaw = await Coupon.find({ 
    isActive: true, 
    validUntil: { $gte: new Date() } 
  }).lean();
  
  const offers = activeCouponsRaw.map((c: any) => ({
    tag: c.code,
    title: `Flat ${c.discountPercentage}% Off`,
    desc: `Save up to ₹${c.maxDiscount} on your booking. Valid till ${new Date(c.validUntil).toLocaleDateString()}.`,
  }));
  
  return (
    <div className="max-w-7xl mx-auto md:max-w-none space-y-6 relative z-0">
      
      {/* Animated Train Background */}
      <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[100vw] h-[600px] overflow-hidden -z-10 pointer-events-none">
         <div 
           className="absolute top-0 left-0 w-[200%] h-full bg-cover bg-center opacity-90 animate-bg-scroll"
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=2000&auto=format&fit=crop')" }}
         ></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#e2e4e7]"></div>
      </div>

      {/* Header Area */}
      <div className="pt-4 pb-2 md:py-8 text-center md:text-left">
        <h2 className="text-slate-600 font-medium mb-1 tracking-wide text-sm">Hi, Welcome</h2>
        <h1 className="text-4xl md:text-5xl font-black text-[#111] tracking-tight leading-[1.1]">
          Explore New<br />Train Trips
        </h1>
      </div>

      {/* Advanced Train Search Component */}
      <TrainSearch />

      {/* Modern Home Page Layout Sections */}
      <HomePageSections popularRoutes={popularRoutes} offers={offers} />
      
    </div>
  );
}
