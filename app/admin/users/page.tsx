import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Booking } from "@/models/Booking";
import UserClient from "./UserClient";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export default async function UsersAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  await dbConnect();
  
  // Fetch users and their booking counts
  const users = await User.find({}).lean();
  
  const usersWithCounts = await Promise.all(
    users.map(async (user: any) => {
      const bookingCount = await Booking.countDocuments({ userId: user._id });
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        totalBookings: bookingCount
      };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Users</h1>
        <p className="text-slate-500 font-medium mt-1">View, manage roles, and delete user accounts.</p>
      </div>

      <UserClient initialUsers={JSON.parse(JSON.stringify(usersWithCounts))} />
    </div>
  );
}
