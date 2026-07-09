import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import { Route } from "@/models/Route";
import { Station } from "@/models/Station";
import Link from "next/link";

export default async function StatusPage({ searchParams }: { searchParams: Promise<{ train?: string }> }) {
  await dbConnect();
  
  const { train: trainQuery } = await searchParams;
  
  if (!trainQuery) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Please enter a valid Train Number</h2>
        <Link href="/" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-full hover:bg-black transition-colors">Go Back</Link>
      </div>
    );
  }

  // Try to find by train number or name
  const train = await Train.findOne({ 
    $or: [
      { trainNumber: trainQuery },
      { name: { $regex: new RegExp(trainQuery, 'i') } }
    ]
  }).populate({
    path: 'route',
    model: Route,
    populate: {
      path: 'stations.station',
      model: Station
    }
  }).lean();

  if (!train) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Train Not Found</h2>
        <p className="text-slate-500 font-medium mb-8">We couldn't find any train matching "{trainQuery}". Please check the number and try again.</p>
        <Link href="/" className="bg-slate-900 text-white font-bold px-8 py-3 rounded-full hover:bg-black transition-colors">Go Back Home</Link>
      </div>
    );
  }

  // Calculate live status (mock)
  const isRunning = Math.random() > 0.3; // 70% chance it's running
  const delayMins = Math.floor(Math.random() * 45); // up to 45 mins delayed

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {train.name}
            <span className="bg-slate-100 text-slate-600 text-sm px-3 py-1 rounded-md">{train.trainNumber}</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">{train.route.source.name} → {train.route.destination.name}</p>
        </div>
      </div>

      {/* Live Status Widget */}
      <div className="bg-gradient-to-br from-slate-900 to-[#111] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
              {isRunning ? (
                <>
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                  Currently Running
                </>
              ) : (
                <>
                  <span className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                  At Station / Scheduled
                </>
              )}
            </h2>
            <p className="text-white/70 font-medium">
              {delayMins === 0 
                ? "Running strictly on time. No delays reported." 
                : `Currently delayed by ${delayMins} minutes.`}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Departure</p>
            <p className="text-3xl font-black">{train.departureTime}</p>
          </div>
        </div>
      </div>

      {/* Schedule / Route Timetable */}
      <div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Route Schedule</h3>
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Station</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Distance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {train.route.stations.map((s: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></div>
                      {s.station.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-500">
                    {s.distanceFromSource} km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
