import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RailConnect - Premium Ticket Booking",
  description: "Book your train tickets seamlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#e2e4e7] text-slate-900 min-h-screen pb-24 md:pb-8 font-sans`}>
        <Providers>
          <Navbar />

          <LayoutWrapper>
            {children}
          </LayoutWrapper>

          <MobileNav />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
