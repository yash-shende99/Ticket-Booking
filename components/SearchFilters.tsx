"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "true") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const filters = [
    { id: "ac", label: "AC Classes Only" },
    { id: "available", label: "Available Seats" },
    { id: "morning", label: "Morning Departure" }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-100">
      <h3 className="font-bold text-slate-900 mb-4 tracking-wide uppercase text-sm">Quick Filters</h3>
      <div className="space-y-3">
        {filters.map((f) => {
          const isChecked = searchParams.get(f.id) === "true";
          
          return (
            <label key={f.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isChecked ? 'bg-[#111] border-[#111]' : 'border-slate-300 group-hover:border-[#111]'
              }`}>
                <input 
                  type="checkbox" 
                  className="opacity-0 absolute w-0 h-0" 
                  checked={isChecked}
                  onChange={(e) => {
                    const newQuery = createQueryString(f.id, e.target.checked ? "true" : "false");
                    router.push(`?${newQuery}`, { scroll: false });
                  }}
                />
                {isChecked && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                {f.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
