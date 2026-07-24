"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AdminNavbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 px-4 md:px-8 lg:px-20 pt-4">
      <div className="w-full bg-white/60 backdrop-blur-xl border border-white/80 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-lg font-black text-white">RC</span>
          </div>
          <div>
            <Link href="/admin" className="font-black text-xl tracking-tight text-slate-900 block leading-tight">Admin Gateway</Link>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Secure Network</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="hidden md:flex text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-white/40 hover:bg-white px-4 py-2 rounded-full border border-slate-200"
          >
            &larr; Back to Consumer Site
          </button>
          
          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-3 bg-white/40 border border-slate-200 pl-2 pr-4 py-1.5 rounded-full hover:bg-white transition-colors">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=2563eb`} alt="Admin" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-bold text-slate-700 hidden md:block">
                {session?.user?.name || "Administrator"}
              </span>
            </div>
            
            {/* Dropdown */}
            <div className="absolute right-0 top-10 pt-2 w-48 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2">
                <button 
                  onClick={() => signOut({ callbackUrl: '/admin/login' })} 
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold transition-colors"
                >
                  Terminate Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
