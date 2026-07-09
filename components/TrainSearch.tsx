"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Station {
  _id: string;
  name: string;
  code: string;
  city: string;
}

export default function TrainSearch() {
  const router = useRouter();
  
  const [from, setFrom] = useState("");
  const [fromStation, setFromStation] = useState<Station | null>(null);
  const [fromOptions, setFromOptions] = useState<Station[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);

  const [to, setTo] = useState("");
  const [toStation, setToStation] = useState<Station | null>(null);
  const [toOptions, setToOptions] = useState<Station[]>([]);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  
  // Quick Filters State
  const [acOnly, setAcOnly] = useState(false);
  const [morning, setMorning] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [refund, setRefund] = useState(false);
  
  const fetchStations = async (query: string, setOptions: (opts: Station[]) => void) => {
    if (query.length < 2) {
      setOptions([]);
      return;
    }
    try {
      const res = await fetch(`/api/stations?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setOptions(data.stations);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => fetchStations(from, setFromOptions), 300);
    return () => clearTimeout(delay);
  }, [from]);

  useEffect(() => {
    const delay = setTimeout(() => fetchStations(to, setToOptions), 300);
    return () => clearTimeout(delay);
  }, [to]);

  const handleSwap = () => {
    const tempFromStr = from;
    const tempFromObj = fromStation;
    setFrom(to);
    setFromStation(toStation);
    setTo(tempFromStr);
    setToStation(tempFromObj);
  };

  const handleSearch = () => {
    if (!fromStation || !toStation) {
      alert("Please select valid source and destination stations from the dropdown.");
      return;
    }

    // Save to Recent Searches in localStorage
    try {
      const stored = localStorage.getItem("rc_recent_searches");
      let recent = stored ? JSON.parse(stored) : [];
      
      const newSearch = {
        fromName: fromStation.name,
        toName: toStation.name,
        source: fromStation._id.toString(),
        dest: toStation._id.toString(),
        date: date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }),
        dateVal: date.toISOString()
      };

      // Remove duplicate if exists and prepend
      recent = recent.filter((r:any) => !(r.source === newSearch.source && r.dest === newSearch.dest));
      recent.unshift(newSearch);
      
      // Keep only top 4
      if (recent.length > 4) recent = recent.slice(0, 4);
      
      localStorage.setItem("rc_recent_searches", JSON.stringify(recent));
    } catch (e) {
      console.log("Could not save recent search", e);
    }

    let url = `/search?source=${fromStation._id}&dest=${toStation._id}&date=${date.toISOString()}`;
    if (acOnly) url += `&ac=true`;
    if (morning) url += `&morning=true`;
    if (confirmed) url += `&available=true`;
    
    router.push(url);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white max-w-5xl mx-auto mb-12">
      
      {/* Top Row: Core Search */}
      <div className="flex flex-col lg:flex-row items-center gap-4 mb-6">
        
        {/* Stations Input Group */}
        <div className="flex items-center w-full lg:w-auto bg-slate-100 rounded-2xl p-1 relative border border-slate-200 shadow-inner">
          <div className="flex items-center bg-transparent px-4 py-3 w-full lg:w-48">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 mr-2 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
            <input 
              type="text" 
              placeholder="From Station" 
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setShowFromDropdown(true);
                setFromStation(null);
              }}
              onFocus={() => setShowFromDropdown(true)}
              onBlur={() => setTimeout(() => setShowFromDropdown(false), 200)}
              className="bg-transparent border-none outline-none w-full text-slate-900 font-semibold placeholder:text-slate-400 text-sm"
            />
            {showFromDropdown && fromOptions.length > 0 && (
              <div className="absolute top-full left-0 w-full lg:w-48 bg-white border border-slate-200 shadow-xl rounded-xl mt-2 z-50 overflow-hidden">
                {fromOptions.map((opt) => (
                  <div 
                    key={opt._id} 
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent focus loss on input
                      setFrom(`${opt.name} (${opt.code})`);
                      setFromStation(opt);
                      setShowFromDropdown(false);
                    }}
                  >
                    <p className="font-bold text-slate-800 text-sm">{opt.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{opt.code} - {opt.city}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={handleSwap}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#111] hover:bg-black text-white rounded-full flex items-center justify-center shadow-md z-10 transition-transform active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </button>

          <div className="flex items-center bg-transparent px-4 py-3 w-full lg:w-48 pl-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-400 mr-2 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="To Station" 
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setShowToDropdown(true);
                setToStation(null);
              }}
              onFocus={() => setShowToDropdown(true)}
              onBlur={() => setTimeout(() => setShowToDropdown(false), 200)}
              className="bg-transparent border-none outline-none w-full text-slate-900 font-semibold placeholder:text-slate-400 text-sm"
            />
            {showToDropdown && toOptions.length > 0 && (
              <div className="absolute top-full left-0 w-full lg:w-48 bg-white border border-slate-200 shadow-xl rounded-xl mt-2 z-50 overflow-hidden">
                {toOptions.map((opt) => (
                  <div 
                    key={opt._id} 
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent focus loss
                      setTo(`${opt.name} (${opt.code})`);
                      setToStation(opt);
                      setShowToDropdown(false);
                    }}
                  >
                    <p className="font-bold text-slate-800 text-sm">{opt.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{opt.code} - {opt.city}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div className="flex flex-1 items-center gap-2 w-full lg:w-auto">
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 flex items-center shadow-sm cursor-pointer hover:border-slate-300 relative">
            <div className="flex flex-col flex-1">
              <label htmlFor="journey-date" className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</label>
              <input 
                id="journey-date"
                type="date"
                value={date.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    setDate(new Date(e.target.value));
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className="font-bold text-slate-900 text-sm bg-transparent outline-none border-none p-0 cursor-pointer w-full"
              />
            </div>
          </div>
          
          <div className="hidden xl:flex gap-2">
            {[1, 2, 3].map((offset) => {
              const d = new Date();
              d.setDate(d.getDate() + offset);
              return (
                <button 
                  key={offset}
                  onClick={() => setDate(d)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-center shadow-sm hover:border-slate-300 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-900">{d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{d.toLocaleDateString("en-GB", { weekday: "long" })}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Button */}
        <button 
          onClick={handleSearch}
          className="w-full lg:w-auto bg-[#111] hover:bg-black text-white rounded-2xl px-8 py-4 font-black shadow-[0_8px_20px_rgb(0,0,0,0.15)] transition-all uppercase tracking-wider text-sm flex items-center justify-center whitespace-nowrap active:scale-95"
        >
          Search Trains
        </button>
      </div>

      {/* Middle Row: Filters & Dropdowns */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
        
        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-2">Quick Filters:</span>
          
          {[
            { id: "ac", label: "AC Only", state: acOnly, setter: setAcOnly },
            { id: "confirmed", label: "Confirmed Seats", state: confirmed, setter: setConfirmed },
            { id: "morning", label: "Morning (06:00 - 12:00)", state: morning, setter: setMorning },
          ].map((filter) => (
            <label key={filter.id} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                filter.state ? 'bg-[#111] border-[#111]' : 'border-slate-300 group-hover:border-slate-400'
              }`}>
                <input 
                  type="checkbox" 
                  className="opacity-0 absolute w-0 h-0" 
                  checked={filter.state}
                  onChange={(e) => filter.setter(e.target.checked)}
                />
                {filter.state && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{filter.label}</span>
            </label>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select className="bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-[#111] shadow-sm appearance-none pr-10 relative">
            <option>All Classes</option>
            <option>1A (First AC)</option>
            <option>2A (Second AC)</option>
            <option>3A (Third AC)</option>
            <option>SL (Sleeper)</option>
          </select>
          
          <select className="bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-[#111] shadow-sm appearance-none pr-10">
            <option>General</option>
            <option>Tatkal</option>
            <option>Ladies</option>
            <option>Senior Citizen</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Toggles */}
      <div className="flex items-center justify-between mt-4 px-2">
        <label 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setRefund(!refund)}
        >
          <div className={`w-10 h-5 rounded-full relative transition-colors ${refund ? 'bg-[#111]' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${refund ? 'left-6' : 'left-1'}`}></div>
          </div>
          <span className="text-sm font-bold text-slate-800">Get a Full Refund on Cancellation</span>
        </label>
        
        <div className="flex items-center gap-2 opacity-70">
          <span className="text-xs font-black text-[#0f2c59] tracking-tight uppercase">IRCTC</span>
          <span className="text-xs font-semibold text-slate-500">Authorized Partner</span>
        </div>
      </div>
    </div>
  );
}
