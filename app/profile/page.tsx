import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { User } from "@/models/User";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  await dbConnect();
  const user = await User.findById((session.user as any).id).lean();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 bg-slate-900 rounded-full border-4 border-white/60 shadow-md overflow-hidden flex items-center justify-center">
          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=111111&textColor=ffffff`} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.name}</h1>
          <p className="text-slate-500 font-medium bg-white/40 inline-block px-3 py-1 rounded-full mt-2 border border-white/60">
            {user.role === 'admin' ? 'Administrator' : 'Passenger Account'}
          </p>
        </div>
      </div>

      <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white/80 space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Full Name</label>
            <div className="w-full px-5 py-4 bg-white/60 border border-white rounded-2xl font-medium text-slate-800 shadow-sm">
              {user.name}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email Address</label>
            <div className="w-full px-5 py-4 bg-white/60 border border-white rounded-2xl font-medium text-slate-800 shadow-sm">
              {user.email}
            </div>
          </div>
        </div>
        
        <div className="pt-6 border-t border-white/50">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">Account Security</h3>
          <button className="bg-[#111] text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-black transition-colors text-sm">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
