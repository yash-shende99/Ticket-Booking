import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";
import Link from "next/link";

export default async function BookTrainPage({ params }: { params: { trainId: string } }) {
  await dbConnect();
  
  let train;
  try {
    train = await Train.findById(params.trainId).lean();
  } catch (error) {
    return notFound();
  }

  if (!train) {
    return notFound();
  }

  return (
    <div className="max-w-lg mx-auto md:max-w-2xl space-y-6">
      {/* Top Bar matching mobile aesthetic */}
      <div className="flex items-center justify-between mb-2">
        <Link href="/" className="w-10 h-10 bg-white/60 backdrop-blur-sm border border-slate-200 rounded-full flex items-center justify-center text-slate-700 hover:bg-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-bold text-slate-900">{train.source} to {train.destination}</h1>
          <p className="text-xs font-medium text-slate-500">{new Date(train.departureTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <div className="w-10 h-10"></div> {/* Spacer for centering */}
      </div>

      {/* Date Pill Selector Mock */}
      <div className="bg-white/60 backdrop-blur-md rounded-full p-1 border border-slate-200 flex justify-between">
        <div className="bg-slate-900 text-white rounded-full py-2 px-6 text-sm font-bold shadow-md">Today</div>
        <div className="text-slate-600 rounded-full py-2 px-6 text-sm font-bold hover:bg-white/50 cursor-pointer">Tomorrow</div>
        <div className="text-slate-600 rounded-full py-2 px-6 text-sm font-bold hover:bg-white/50 cursor-pointer hidden sm:block">Next Week</div>
      </div>

      {/* Outbound Trip Card */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Outbound Trip</h2>
          <div className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-bold text-slate-600 border border-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filters
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-slate-900">{new Date(train.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{train.source}</p>
          </div>
          <div className="flex-1 px-6 flex flex-col items-center">
            <div className="w-full h-[2px] bg-slate-200 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 border border-slate-200 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                  <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Direct</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{new Date(train.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">{train.destination}</p>
          </div>
        </div>
      </div>

      <BookingForm train={JSON.parse(JSON.stringify(train))} />
    </div>
  );
}
