"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePageSections({ popularRoutes }: { popularRoutes?: any[] }) {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("rc_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      } else {
        // Fallback default if none
        setRecentSearches([
          { fromName: "New Delhi", toName: "Mumbai", date: "Tomorrow", source: "", dest: "" },
        ]);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const handleLiveStatus = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    router.push(`/status?train=${formData.get("trainNo")}`);
  };

  const handlePnrStatus = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    router.push(`/bookings?pnr=${formData.get("pnr")}`); // redirect to bookings
  };

  const handleSchedule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    router.push(`/status?train=${formData.get("trainNo")}`);
  };

  const routeGradients = [
    "bg-gradient-to-br from-indigo-500 to-purple-600",
    "bg-gradient-to-br from-emerald-400 to-teal-500",
    "bg-gradient-to-br from-rose-400 to-red-500",
    "bg-gradient-to-br from-amber-400 to-orange-500",
  ];

  const displayRoutes = popularRoutes && popularRoutes.length > 0 ? popularRoutes : [
    { name: "Delhi - Mumbai" },
    { name: "Bangalore - Chennai" },
  ];

  return (
    <div className="space-y-16 mt-12 pb-24">
      
      {/* 1. Recent Searches & Popular Routes */}
      <section className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Recent Searches */}
          <div className="flex-1 overflow-hidden">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Searches
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentSearches.slice(0, 4).map((route, i) => (
                <div onClick={() => route.source && route.dest && router.push(`/search?source=${route.source}&dest=${route.dest}&date=${route.dateVal}`)} key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                        {route.fromName} 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-slate-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                        {route.toName}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold tracking-wide mt-0.5">{route.date}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-900">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Routes */}
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
              </svg>
              Trending Now
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {displayRoutes.slice(0,4).map((route, i) => (
                <div onClick={() => route.sourceId && router.push(`/search?source=${route.sourceId}&dest=${route.destId}&date=${new Date().toISOString()}`)} key={i} className={`${routeGradients[i % routeGradients.length]} rounded-3xl p-5 shadow-lg text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform`}>
                  <div className="absolute top-0 right-0 p-3 opacity-20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 transform rotate-45 -translate-y-4 translate-x-4">
                      <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375z" />
                      <path fillRule="evenodd" d="M3.087 9l.54 9.176A3 3 0 006.62 21h10.757a3 3 0 002.995-2.824L20.913 9H3.087zm6.163 3.75A.75.75 0 0110 12h4a.75.75 0 010 1.5h-4a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h4 className="font-black text-lg relative z-10 w-2/3 leading-tight">{route.name}</h4>
                  <div className="mt-4 inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold relative z-10 hover:bg-white/30 transition-colors">Book Now</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Tools */}
      <section>
        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Quick Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Live Train Status */}
          <form onSubmit={handleLiveStatus} className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white hover:shadow-lg transition-all group">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Live Train Status</h4>
            <p className="text-sm font-medium text-slate-500 mb-6">Track your train in real-time</p>
            <div className="flex gap-2">
              <input name="trainNo" type="text" placeholder="Train No." required className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-sm">Track</button>
            </div>
          </form>

          {/* PNR Status */}
          <form onSubmit={handlePnrStatus} className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white hover:shadow-lg transition-all group">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">PNR Status</h4>
            <p className="text-sm font-medium text-slate-500 mb-6">Check reservation status instantly</p>
            <div className="flex gap-2">
              <input name="pnr" type="text" placeholder="10-digit PNR" maxLength={10} required className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400" />
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-sm">Check</button>
            </div>
          </form>

          {/* Train Schedule */}
          <form onSubmit={handleSchedule} className="bg-white/80 backdrop-blur-md rounded-[2.5rem] p-6 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white hover:shadow-lg transition-all group">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">Train Schedule</h4>
            <p className="text-sm font-medium text-slate-500 mb-6">View complete route timetables</p>
            <div className="flex gap-2">
              <input name="trainNo" type="text" placeholder="Train No. / Name" required className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400" />
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl transition-colors shadow-sm">Search</button>
            </div>
          </form>

        </div>
      </section>

      {/* 3. Offers & Promotions */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Offers & Deals</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">Exclusive rewards just for you</p>
          </div>
          <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-full transition-colors">View All</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tag: "FESTIVE", title: "Flat 20% Off on AC Classes", desc: "Use code FEST20 on checkout. Valid till end of month.", color: "bg-[#111] text-white" },
            { tag: "CASHBACK", title: "Get ₹500 Cashback", desc: "Book using RailConnect Pay and earn instant cashback.", color: "bg-blue-600 text-white" },
            { tag: "NEW USER", title: "Zero Convenience Fee", desc: "Your first booking is completely free of platform charges.", color: "bg-amber-400 text-amber-950" }
          ].map((offer, i) => (
            <div key={i} className={`${offer.color} rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1`}>
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-md inline-block mb-4 shadow-sm">{offer.tag}</span>
              <h4 className="text-2xl font-black mb-3 leading-tight tracking-tight">{offer.title}</h4>
              <p className="text-sm opacity-80 font-medium leading-relaxed">{offer.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Layout Split: Announcements & News + Help Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Announcements */}
        <section className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Announcements & News</h3>
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 md:p-8 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white/80 space-y-6">
            {[
              { date: "Oct 24", tag: "SERVICE", title: "New Vande Bharat Express introduced on Delhi-Jaipur route", desc: "Experience world-class travel with the new semi-high speed train starting next week. Bookings are now open for all classes." },
              { date: "Oct 22", tag: "UPDATE", title: "Monsoon Schedule Updates", desc: "Several trains in the Konkan region have been rescheduled. Please check Live Status before traveling to avoid inconvenience." },
              { date: "Oct 18", tag: "MAINTENANCE", title: "System Maintenance Notice", desc: "Booking services will be unavailable between 23:30 and 00:30 tonight for scheduled database upgrades and optimizations." },
            ].map((news, i) => (
              <div key={i} className="flex gap-5 group cursor-pointer p-2 rounded-2xl hover:bg-white/60 transition-colors">
                <div className="w-16 h-16 bg-white rounded-2xl flex flex-col items-center justify-center shrink-0 border border-slate-100 group-hover:bg-[#111] group-hover:border-[#111] group-hover:text-white transition-all shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-300">{news.date.split(' ')[0]}</span>
                  <span className="text-xl font-black leading-none mt-0.5">{news.date.split(' ')[1]}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">{news.tag}</span>
                  <h4 className="text-base font-black text-slate-900 mt-2 mb-1 group-hover:text-blue-600 transition-colors leading-tight">{news.title}</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">{news.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Help Section */}
        <section className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Help & Support</h3>
          <div className="bg-[#111] text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/30 rounded-full blur-3xl pointer-events-none"></div>
            
            <div>
              <h4 className="text-3xl font-black mb-3 tracking-tight">Need<br />Assistance?</h4>
              <p className="text-slate-400 font-medium text-sm mb-8 leading-relaxed">We're here 24/7 to help you with your bookings, cancellations, and queries. Experience premium support.</p>
            </div>
            
            <div className="space-y-3 relative z-10">
              <button className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-left px-6 py-4 rounded-2xl flex justify-between items-center transition-all group">
                <span className="font-bold">FAQs</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <button className="w-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-left px-6 py-4 rounded-2xl flex justify-between items-center transition-all group">
                <span className="font-bold">Cancellation Rules</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-500 border border-blue-400 text-left px-6 py-4 rounded-2xl flex justify-between items-center transition-all shadow-lg group mt-6">
                <span className="font-bold">Contact Support</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
