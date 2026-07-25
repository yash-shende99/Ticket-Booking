import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import Link from "next/link";
import Pagination from "@/components/Pagination";

export const dynamic = 'force-dynamic';

export default async function LiveStatusIndexPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await dbConnect();
  
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const limit = 8;

  const trains = await Train.find({ isActive: true }).sort({ name: 1 }).lean();
  
  const totalPages = Math.ceil(trains.length / limit);
  const trainsToDisplay = trains.slice((page - 1) * limit, page * limit);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Live Train Status</h1>
        <p className="text-slate-500 mt-3 text-lg font-medium">Select a train to track its real-time GPS location and ETA.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trainsToDisplay.map((train: any) => (
          <Link 
            key={train._id.toString()} 
            href={`/live-status/${train._id.toString()}`}
            className="group block bg-white/60 backdrop-blur-md border border-white/80 rounded-[2rem] p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 tracking-widest uppercase">Live Tracking</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{train.name}</h3>
                <p className="text-slate-500 font-bold mt-1 tracking-wide">#{train.trainNumber}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                <span className="text-blue-500 font-bold text-xl">&rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
