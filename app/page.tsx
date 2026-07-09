import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import Link from "next/link";

export default async function Home() {
  await dbConnect();
  
  const trains = await Train.find({}).lean();

  return (
    <div className="max-w-md mx-auto md:max-w-none space-y-6">
      
      {/* Header Area */}
      <div className="pt-4 pb-2 md:py-8">
        <h2 className="text-slate-600 font-medium mb-1 tracking-wide text-sm">Hi, Welcome</h2>
        <h1 className="text-4xl md:text-5xl font-black text-[#111] tracking-tight leading-[1.1]">
          Explore New<br />Train Trips
        </h1>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-white/40 rounded-full px-5 py-3.5 flex items-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-500 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="" className="bg-transparent w-full outline-none text-slate-800 placeholder-slate-400 font-medium" />
        </div>
        <div className="bg-white/20 border border-white/60 w-14 h-14 rounded-full flex items-center justify-center text-slate-600 shadow-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
        </div>
      </div>

      {/* Categories / Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide pt-2">
        <div className="bg-[#111] text-white px-2 py-2 pr-5 rounded-full flex items-center gap-3 font-semibold whitespace-nowrap shrink-0 shadow-md">
          <div className="bg-white text-slate-900 rounded-full w-10 h-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          Train Travel
        </div>
        <div className="bg-white/20 border border-white/60 w-14 h-14 rounded-full flex items-center justify-center text-slate-500 hover:bg-white/40 shrink-0 shadow-sm cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </div>
        <div className="bg-white/20 border border-white/60 w-14 h-14 rounded-full flex items-center justify-center text-slate-500 hover:bg-white/40 shrink-0 shadow-sm cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <div className="bg-white/20 border border-white/60 w-14 h-14 rounded-full flex items-center justify-center text-slate-500 hover:bg-white/40 shrink-0 shadow-sm cursor-pointer">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
           </svg>
        </div>
      </div>

      {/* Train Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {trains.map((train: any) => (
          <div key={train._id.toString()} className="bg-white/30 backdrop-blur-md rounded-[2.5rem] p-4 pb-6 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white/80 relative group hover:shadow-[0_8px_32px_rgb(0,0,0,0.06)] transition-all">
            
            {/* Top Badges */}
            <div className="flex justify-between items-center mb-6 px-1">
              <div className="bg-white/80 rounded-full px-4 py-2 flex items-center gap-1 shadow-sm">
                <span className="text-[#111] text-sm">★</span>
                <span className="text-sm font-bold text-slate-800 tracking-wide">4.8</span>
              </div>
              <div className="bg-white/80 w-10 h-10 rounded-full flex items-center justify-center shadow-sm text-slate-900 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Image/Graphic Placeholder */}
            <div className="w-full h-40 mb-6 flex flex-col items-center justify-center">
               {/* Minimal elegant icon instead of large bus */}
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-32 h-32 text-slate-400 drop-shadow-md">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
               </svg>
            </div>

            {/* Content */}
            <div className="px-3 flex items-end justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-1">{train.name}</h3>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-bold text-slate-800">
                    ₹{train.priceGeneral}
                  </p>
                  <span className="text-xs text-slate-400 font-medium">/ seat</span>
                </div>
              </div>
              <Link href={`/book/${train._id.toString()}`} className="bg-[#111] text-white text-sm font-semibold px-5 py-3 rounded-full hover:bg-black transition-colors shadow-lg">
                View details
              </Link>
            </div>

          </div>
        ))}

        {trains.length === 0 && (
          <p className="text-slate-500 col-span-full px-4">No trains available.</p>
        )}
      </div>
    </div>
  );
}
