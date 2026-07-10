"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "COMPLETED" | "CANCELLED">("UPCOMING");
  const router = useRouter();

  // Filter bookings based on status and date
  const now = new Date();
  now.setHours(0,0,0,0);

  const upcomingBookings = initialBookings.filter(b => b.status !== "CANCELLED" && new Date(b.journeyDate) >= now);
  const completedBookings = initialBookings.filter(b => b.status !== "CANCELLED" && new Date(b.journeyDate) < now);
  const cancelledBookings = initialBookings.filter(b => b.status === "CANCELLED");

  let displayBookings = upcomingBookings;
  if (activeTab === "COMPLETED") displayBookings = completedBookings;
  else if (activeTab === "CANCELLED") displayBookings = cancelledBookings;

  const handleShare = async (pnr: string) => {
    const url = `${window.location.origin}/bookings/${pnr}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Train Ticket (PNR: ${pnr})`,
          text: 'Here is my train ticket from RailConnect!',
          url: url,
        });
      } catch (err) {
        console.log("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Ticket link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto md:max-w-none space-y-6">
      <div className="pt-2 pb-6 md:py-8 flex justify-between items-end">
        <div>
          <h2 className="text-slate-500 font-medium mb-1">Booking History</h2>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            My Trips
          </h1>
        </div>
        <Link href="/" className="hidden md:inline-block bg-slate-900 text-white font-bold py-2.5 px-6 rounded-full hover:bg-black transition-colors">
          Book New Ticket
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
        <button 
          onClick={() => setActiveTab("UPCOMING")}
          className={`pb-3 px-4 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'UPCOMING' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
        >
          Upcoming Trips ({upcomingBookings.length})
        </button>
        <button 
          onClick={() => setActiveTab("COMPLETED")}
          className={`pb-3 px-4 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'COMPLETED' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
        >
          Completed Trips ({completedBookings.length})
        </button>
        <button 
          onClick={() => setActiveTab("CANCELLED")}
          className={`pb-3 px-4 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'CANCELLED' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
        >
          Cancelled Trips ({cancelledBookings.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-2">
        {displayBookings.length === 0 ? (
          <div className="col-span-full bg-white/70 backdrop-blur-md p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No {activeTab.toLowerCase()} trips found</h3>
            <p className="text-slate-500 mb-8 font-medium">You don't have any tickets in this category.</p>
            {activeTab === "UPCOMING" && (
              <Link href="/" className="bg-slate-900 text-white hover:bg-black px-8 py-3 rounded-full font-bold transition-colors">
                Explore Trips
              </Link>
            )}
          </div>
        ) : (
          displayBookings.map((booking: any) => {
            const train = booking.trainId;
            let computedArrivalTime = "--:--";
            let dayOffset = 0;
            if (train?.departureTime && train?.route?.stations?.length > 0) {
              const totalDistance = train.route.stations[train.route.stations.length - 1].distanceFromSource;
              const destTimeOffsetMs = (totalDistance / 60) * 60 * 60 * 1000;
              const [depHours, depMins] = train.departureTime.split(':').map(Number);
              const originDate = new Date();
              originDate.setHours(depHours, depMins, 0, 0);
              const destArrivalDate = new Date(originDate.getTime() + destTimeOffsetMs);
              computedArrivalTime = `${destArrivalDate.getHours().toString().padStart(2, '0')}:${destArrivalDate.getMinutes().toString().padStart(2, '0')}`;
              const startDay = originDate.getDate();
              const endDay = destArrivalDate.getDate();
              if (endDay !== startDay) {
                dayOffset = destArrivalDate.getDate() - originDate.getDate();
                if (dayOffset < 0) dayOffset = 1;
              }
            }

            return (
              <div key={booking._id.toString()} className={`bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all ${booking.status === 'CANCELLED' ? 'grayscale opacity-80' : ''}`}>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                    <div className="bg-slate-100 rounded-full px-4 py-1 flex items-center shadow-sm border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">PNR: <span className="text-slate-900">{booking.pnr}</span></span>
                    </div>
                    {booking.journeyDate && (
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-blue-100">
                        {new Date(booking.journeyDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${(!booking.status || booking.status === 'CONFIRMED') ? 'bg-emerald-100 text-emerald-700' : booking.status === 'RAC' ? 'bg-amber-100 text-amber-700' : booking.status === 'WL' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {booking.status || 'CONFIRMED'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {train?.departureTime || "--:--"}
                    </p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 w-24 truncate" title={train?.route?.stations?.[0]?.station?.name}>
                      {train?.route?.stations?.[0]?.station?.name || "SRC"}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1 px-4 relative">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -z-10"></div>
                    <div className="bg-white p-2 rounded-full border-2 border-slate-100 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                      {booking.seatClass} CLASS
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="flex items-start justify-end">
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">
                        {computedArrivalTime}
                      </p>
                      {dayOffset > 0 && (
                        <span className="text-[10px] font-bold text-red-500 -mt-1 ml-1">+{dayOffset}</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1 w-24 truncate text-right" title={train?.route?.stations?.[train.route.stations.length - 1]?.station?.name}>
                      {train?.route?.stations?.[train.route.stations.length - 1]?.station?.name || "DEST"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                  <div className="text-slate-500 font-medium">
                    <span className="font-bold text-slate-700">{booking.passengers.length}</span> Passenger{booking.passengers.length > 1 ? 's' : ''}
                  </div>
                  <div className="font-bold text-slate-900 flex gap-2">
                    <Link href={`/?source=${train?.route?.stations?.[0]?.station?.name}&dest=${train?.route?.stations?.[train.route.stations.length - 1]?.station?.name}`} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors text-xs font-bold uppercase tracking-wider">Rebook</Link>
                    <button onClick={() => handleShare(booking.pnr)} className="text-slate-600 hover:bg-slate-100 px-2 py-1 rounded transition-colors text-xs font-bold uppercase tracking-wider">Share</button>
                    <Link href={`/bookings/${booking.pnr}`} className="text-slate-900 hover:bg-slate-100 px-2 py-1 rounded transition-colors text-xs font-bold uppercase tracking-wider">Manage</Link>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
