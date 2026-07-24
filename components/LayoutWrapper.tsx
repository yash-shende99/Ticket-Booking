"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-4 md:py-10">
      {children}
    </main>
  );
}
