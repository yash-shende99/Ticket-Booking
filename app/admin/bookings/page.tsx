import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import { Train } from "@/models/Train";
import BookingClient from "./BookingClient";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export default async function BookingsAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  await dbConnect();
  
  // Ensure models are registered
  if (!mongoose.models.User) mongoose.model('User', User.schema);
  if (!mongoose.models.Train) mongoose.model('Train', Train.schema);

  const bookings = await Booking.find({})
    .populate("userId", "name email")
    .populate("trainId", "trainNumber name")
    .sort({ createdAt: -1 })
    .lean();
    
  // Transform to plain objects for client component
  const plainBookings = bookings.map(b => ({
    _id: b._id.toString(),
    pnr: b.pnr,
    user: b.userId ? { name: (b.userId as any).name, email: (b.userId as any).email } : { name: "Guest", email: "N/A" },
    train: b.trainId ? { trainNumber: (b.trainId as any).trainNumber, name: (b.trainId as any).name } : { trainNumber: "N/A", name: "Unknown Train" },
    journeyDate: b.journeyDate,
    seatClass: b.seatClass,
    status: b.status,
    totalFare: b.pricePaid,
    passengers: b.passengers.length
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Bookings</h1>
        <p className="text-slate-500 font-medium mt-1">View and monitor all ticket reservations across the network.</p>
      </div>

      <BookingClient initialBookings={plainBookings} />
    </div>
  );
}
