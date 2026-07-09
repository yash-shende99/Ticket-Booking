"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dashboard", href: "/admin" },
    { name: "Stations", href: "/admin/stations" },
    { name: "Routes", href: "/admin/routes" },
    { name: "Trains", href: "/admin/trains" },
    { name: "Inventory", href: "/admin/inventory" },
    { name: "Bookings", href: "/admin/bookings" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen gap-6 py-6">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white/80 sticky top-24">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 px-2">Admin Panel</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
                    isActive 
                      ? "bg-[#111] text-white shadow-md" 
                      : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      
      <main className="flex-1 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white/80">
        {children}
      </main>
    </div>
  );
}
