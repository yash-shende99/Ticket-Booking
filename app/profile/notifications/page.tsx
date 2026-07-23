import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Notification } from "@/models/Notification";

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await dbConnect();

  // Fetch all active system notifications (newest first)
  const notifications = await Notification.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-slate-500 font-medium mt-1">Stay updated with system announcements and alerts.</p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black">
              🔔
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Notifications</h3>
            <p className="text-slate-500 mt-1">You're all caught up! There are no new announcements.</p>
          </div>
        ) : (
          notifications.map((notif: any) => {
            const dateStr = new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            // Map types to styles
            const styles = {
              INFO: 'bg-blue-50 border-blue-200 text-blue-600',
              ALERT: 'bg-red-50 border-red-200 text-red-600',
              PROMO: 'bg-emerald-50 border-emerald-200 text-emerald-600'
            };
            const icon = {
              INFO: 'ℹ️',
              ALERT: '⚠️',
              PROMO: '🎁'
            };
            
            const typeStyle = styles[notif.type as keyof typeof styles] || styles.INFO;
            const typeIcon = icon[notif.type as keyof typeof icon] || icon.INFO;

            return (
              <div key={notif._id.toString()} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex gap-5">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border ${typeStyle}`}>
                  <span className="text-xl">{typeIcon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${typeStyle}`}>
                      {notif.type}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{dateStr}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{notif.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">{notif.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
