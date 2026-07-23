"use client";

import { useEffect, useState } from "react";
import { fetchLiveStatus } from "../actions";
import Link from "next/link";

export default function LiveClient({ trainId }: { trainId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await fetchLiveStatus(trainId);
      setData(result);
      setLoading(false);
    };
    
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [trainId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold animate-pulse">Connecting to Live GPS Feed...</p>
      </div>
    );
  }

  if (!data) return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">🛰️</div>
      <h2 className="text-2xl font-black text-slate-900 mb-4">Train tracking data unavailable</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">We couldn't connect to the GPS transponder for this train. It may not have an assigned route or departure time yet.</p>
      <Link href="/live-status" className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors">Return to Tracking Search</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/live-status" className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">&larr;</span> Back
      </Link>
      
      {/* Hero Header */}
      <div className="bg-[#0b1120] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl mb-8 border border-white/10">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-black text-emerald-400 tracking-widest uppercase">Live GPS Tracking</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-white">{data.trainName}</h1>
            <p className="text-slate-400 font-medium text-lg">#{data.trainNumber}</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-w-[200px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Current Speed</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-white leading-none">{data.speed}</span>
              <span className="text-slate-400 font-bold mb-1">km/h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Current Location</p>
            <p className="text-2xl font-black text-slate-900 leading-tight">{data.currentLocation}</p>
          </div>
          
          <div className="bg-[#f8fafc] border border-slate-200 rounded-[2rem] p-8 shadow-sm text-center">
             <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">Next Station ETA</p>
             <p className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{data.eta}</p>
             <p className="text-sm font-bold text-slate-500">{data.nextStation}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Status</p>
              <p className={`text-lg font-black ${data.status === 'RUNNING' ? 'text-emerald-500' : 'text-amber-500'}`}>{data.status}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Platform</p>
              <p className="text-xl font-black text-slate-900">{data.platform}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm h-full">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900">Journey Progress</h3>
              <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200">
                {Math.round(data.progress)}% to next stop
              </div>
            </div>
            
            <div className="relative pl-10 space-y-10">
              {/* Vertical Line */}
              <div className="absolute top-2 left-[15px] bottom-4 w-1 bg-slate-100 rounded-full"></div>
              
              {data.timeline.map((station: any, idx: number) => {
                const isPassed = station.state === "PASSED";
                const isHalted = station.state === "HALTED";
                const isFuture = station.state === "FUTURE";
                
                return (
                  <div key={idx} className="relative z-10 flex items-start gap-6">
                    {/* Circle Indicator */}
                    <div className="relative mt-1 shrink-0">
                      <div className={`absolute -left-[41px] w-6 h-6 rounded-full border-[4px] border-white shadow-sm flex items-center justify-center
                        ${isPassed ? 'bg-slate-900' : isHalted ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        {isHalted && (
                          <span className="absolute w-full h-full rounded-full bg-emerald-500 animate-ping opacity-50"></span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`transition-opacity w-full ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`text-xl font-black ${isHalted ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {station.name}
                        </h4>
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          {station.code}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-400">
                        {isPassed ? 'Train has departed' : isHalted ? 'Train currently at station' : `Distance: ${station.distance} km`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
