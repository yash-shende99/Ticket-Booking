import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function ScheduleIndexPage() {
  await dbConnect();
  const trains = await Train.find({ isActive: true }).sort({ name: 1 }).lean();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Network Timetables</h1>
        <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Explore official schedules and route maps for all active trains across the entire railway network.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trains.map(train => (
          <Link 
            key={train._id.toString()} 
            href={`/schedule/${train._id.toString()}`}
            className="group block relative bg-white/40 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-[0_8px_32px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgb(37,99,235,0.1)] transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
              <span className="text-blue-500 font-bold">&rarr;</span>
            </div>
            
            <div className="mb-6 inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
              Train {train.trainNumber}
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
              {train.name}
            </h3>
            
            <div className="mt-8 flex justify-between items-end border-t border-slate-100 pt-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Scheduled Dep</p>
                <p className="text-2xl font-black text-slate-800">{train.departureTime || "00:00"}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
