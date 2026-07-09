"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isBookings = pathname?.startsWith('/bookings');

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-[#e2e4e7]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center font-bold text-lg">
                RC
              </div>
              <Link href="/" className="font-bold text-2xl tracking-tight text-slate-900">RailConnect</Link>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/20 border border-white/40 p-1 rounded-full">
              <Link href="/" className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${!isBookings ? 'bg-[#1a1a1a] text-white' : 'text-slate-600 hover:text-slate-900'}`}>Explore</Link>
              <Link href="/bookings" className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${isBookings ? 'bg-[#1a1a1a] text-white' : 'text-slate-600 hover:text-slate-900'}`}>My Tickets</Link>
            </div>

            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <span className="text-sm font-bold text-slate-700 hidden lg:block">Hi, {session.user?.name?.split(' ')[0]}</span>
                  <div className="w-10 h-10 bg-slate-300 rounded-full overflow-hidden shadow-sm relative group cursor-pointer border-2 border-transparent hover:border-white transition-all">
                    <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${session.user?.name}`} alt="Avatar" className="w-full h-full object-cover" />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity border border-slate-100">
                      <div className="p-2">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl font-medium">Profile</Link>
                        {(session.user as any)?.role === 'admin' && (
                          <Link href="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-xl font-bold">Admin Dashboard</Link>
                        )}
                        <button onClick={() => signOut()} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium mt-1">Sign out</button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/login" className="bg-white text-slate-900 border border-slate-200 px-6 py-2 rounded-full text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Top Nav */}
      <nav className="md:hidden flex items-center justify-between p-6 pb-2">
        <div className="w-12 h-12 rounded-full border border-white/60 flex items-center justify-center shadow-sm text-slate-700 bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </div>
        
        <div className="flex items-center gap-2">
          {session ? (
            <div className="w-12 h-12 bg-slate-300 rounded-full overflow-hidden shadow-sm border border-white/60">
              <img src={`https://api.dicebear.com/7.x/fun-emoji/svg?seed=${session.user?.name}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          ) : (
            <Link href="/login" className="bg-[#111] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
