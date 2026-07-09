import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import Link from "next/link";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ pnr?: string }> }) {
  await dbConnect();
  
  const { pnr } = await searchParams;
  const query = pnr ? { pnr: pnr.toUpperCase() } : {};
  
  const bookings = await Booking.find(query)
    .populate({
      path: 'trainId',
      populate: {
        path: 'route',
        populate: [
          { path: 'source', model: 'Station' },
          { path: 'destination', model: 'Station' }
        ]
      }
    })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-lg mx-auto md:max-w-none space-y-6">
      <div className="pt-2 pb-6 md:py-8 flex justify-between items-end">
        <div>
          <h2 className="text-slate-500 font-medium mb-1">Your Itineraries</h2>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            My Tickets
          </h1>
        </div>
        <Link href="/" className="hidden md:inline-block bg-slate-900 text-white font-bold py-2.5 px-6 rounded-full hover:bg-black transition-colors">
          Book New Ticket
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {bookings.length === 0 ? (
          <div className="col-span-full bg-white/70 backdrop-blur-md p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No active trips</h3>
            <p className="text-slate-500 mb-8 font-medium">You haven't booked any tickets yet.</p>
            <Link href="/" className="bg-slate-900 text-white hover:bg-black px-8 py-3 rounded-full font-bold transition-colors">
              Explore Trips
            </Link>
          </div>
        ) : (
          bookings.map((booking: any) => {
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
              
              // Calculate day offset
              const startDay = originDate.getDate();
              const endDay = destArrivalDate.getDate();
              if (endDay !== startDay) {
                dayOffset = destArrivalDate.getDate() - originDate.getDate();
                if (dayOffset < 0) {
                   // handles end of month
                   const temp = new Date(originDate.getTime());
                   temp.setDate(temp.getDate() + 1);
                   if (temp.getDate() === destArrivalDate.getDate()) dayOffset = 1;
                   else dayOffset = 2; // Rough approximation
                }
              }
            }

            return (
              <div key={booking._id.toString()} className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                
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
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${(!booking.status || booking.status === 'CONFIRMED') ? 'bg-green-100 text-green-700' : booking.status === 'RAC' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {booking.status || 'CONFIRMED'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {train?.departureTime ? train.departureTime.split(':').slice(0,2).join(':') : '--:--'}
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                      {train?.route?.source?.name || 'Origin'}
                    </p>
                  </div>
                  <div className="flex-1 px-4 flex flex-col items-center">
                    <div className="w-full h-[2px] border-t-2 border-dashed border-slate-300 relative">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 text-slate-400 border border-slate-200">
                        🚆
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-end justify-end gap-1">
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">
                        {computedArrivalTime}
                      </p>
                      {dayOffset > 0 && (
                        <p className="text-sm font-bold text-slate-500 mb-1">
                          +{dayOffset}d
                        </p>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                      {train?.route?.destination?.name || 'Destination'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Class</p>
                    <p className="font-bold text-slate-800 text-sm">{booking.seatClass}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Train</p>
                    <p className="font-bold text-slate-800 text-sm truncate">{train?.name || 'Unknown'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Passengers & Seat Allocation</p>
                    <div className="space-y-2">
                      {booking.passengers?.map((p: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{p.name} <span className="text-slate-400 font-medium text-xs">({p.age}, {p.gender.charAt(0)})</span></p>
                            {p.mealPreference && p.mealPreference !== "None" && (
                              <p className="text-[10px] font-bold text-amber-500 uppercase">Meal: {p.mealPreference}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {booking.status === "CONFIRMED" ? (
                              <>
                                <p className="font-black text-slate-900 text-sm">{p.allocatedCoach} - {p.allocatedSeat}</p>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase">{p.allocatedBerthType}</p>
                              </>
                            ) : (
                              <p className="font-black text-amber-500 text-sm">{booking.status}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Amount Paid</p>
                    <p className="font-black text-slate-900 text-lg">₹{booking.pricePaid}</p>
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
