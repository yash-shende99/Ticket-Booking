"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { AdminNavbar } from "@/components/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    const isAdmin = (session?.user as any)?.role === "admin";
    const isLoginPage = pathname === "/admin/login";

    if (!isAdmin && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [session, status, pathname, router]);

  // If loading or unauthorized (and not on login page), don't render layout content to prevent flashing
  if (status === "loading" || (!session && pathname !== "/admin/login")) {
    return <div className="min-h-screen bg-[#e2e4e7] flex items-center justify-center">Authenticating...</div>;
  }

  // If on login page, just render children without sidebar or admin navbar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navGroups = [
    {
      title: "Dashboard",
      items: [
        { name: "Overview", href: "/admin" },
        { name: "Revenue", href: "/admin/revenue" },
        { name: "Daily Bookings", href: "/admin/bookings/daily" },
        { name: "Popular Routes", href: "/admin/routes/popular" },
      ]
    },
    {
      title: "Manage",
      items: [
        { name: "Users", href: "/admin/users" },
        { name: "Trains", href: "/admin/trains" },
        { name: "Stations", href: "/admin/stations" },
        { name: "Routes", href: "/admin/routes" },
        { name: "Bookings", href: "/admin/bookings" },
        { name: "Refunds", href: "/admin/refunds" },
        { name: "Coupons", href: "/admin/coupons" },
        { name: "Notifications", href: "/admin/notifications" },
      ]
    }
  ];

  return (
    <div className="min-h-screen relative">
      <AdminNavbar />
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] gap-6 py-6 px-4 md:px-8 lg:px-20 relative z-10 w-full">
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white/80 sticky top-24">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6 px-2">Admin Panel</h2>
          <nav className="space-y-6">
            {navGroups.map((group) => (
              <div key={group.title}>
                <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{group.title}</h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-4 py-2.5 rounded-2xl font-bold transition-all text-sm ${
                          isActive 
                            ? "bg-[#111] text-white shadow-md" 
                            : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
      
      <main className="flex-1 bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white/80">
        {children}
      </main>
    </div>
    </div>
  );
}
