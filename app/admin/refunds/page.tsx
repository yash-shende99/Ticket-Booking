import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { User } from "@/models/User";
import RefundClient from "./RefundClient";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export default async function RefundsAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  await dbConnect();
  
  if (!mongoose.models.User) mongoose.model('User', User.schema);

  // Fetch only CANCELLED bookings that might need refunds
  const cancelledBookings = await Booking.find({ status: "CANCELLED" })
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();
    
  const plainRefunds = cancelledBookings.map(b => ({
    _id: b._id.toString(),
    pnr: b.pnr,
    user: b.userId ? { name: (b.userId as any).name, email: (b.userId as any).email } : { name: "Guest", email: "N/A" },
    amount: b.pricePaid,
    paymentStatus: b.paymentStatus,
    cancelledAt: (b as any).updatedAt || (b as any).createdAt,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Refunds</h1>
        <p className="text-slate-500 font-medium mt-1">Process refunds for cancelled tickets.</p>
      </div>

      <RefundClient initialRefunds={plainRefunds} />
    </div>
  );
}
