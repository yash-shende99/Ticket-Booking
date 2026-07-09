import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h1>
        <p className="text-slate-500 font-medium">Monitor your railway network performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Stations</p>
          <p className="text-4xl font-black text-slate-900">0</p>
        </div>
        <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Active Routes</p>
          <p className="text-4xl font-black text-slate-900">0</p>
        </div>
        <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Trains</p>
          <p className="text-4xl font-black text-slate-900">0</p>
        </div>
      </div>

      <div className="bg-white/60 p-8 rounded-3xl border border-white shadow-sm mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <button className="bg-[#111] text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-black transition-colors text-sm">
            + Add Station
          </button>
          <button className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors text-sm">
            + Create Route
          </button>
        </div>
      </div>
    </div>
  );
}
