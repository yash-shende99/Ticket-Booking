import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Notification } from "@/models/Notification";
import NotificationClient from "./NotificationClient";

export const dynamic = 'force-dynamic';

export default async function NotificationsAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  await dbConnect();
  
  const notifications = await Notification.find({}).sort({ createdAt: -1 }).lean();
    
  const plainNotifs = notifications.map(n => ({
    _id: n._id.toString(),
    title: n.title,
    message: n.message,
    type: n.type,
    isActive: n.isActive,
    createdAt: n.createdAt
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Notifications</h1>
        <p className="text-slate-500 font-medium mt-1">Blast global announcements and alerts to all users.</p>
      </div>

      <NotificationClient initialNotifications={plainNotifs} />
    </div>
  );
}
