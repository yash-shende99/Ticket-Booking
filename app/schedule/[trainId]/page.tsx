import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

function addMinutesToTime(timeStr: string, minutesToAdd: number) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
    timeStr = "00:00";
  }
  const [hoursStr, minsStr] = timeStr.split(':');
  let date = new Date();
  date.setHours(Number(hoursStr), Number(minsStr), 0, 0);
  date.setMinutes(date.getMinutes() + minutesToAdd);
  
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default async function TrainSchedulePage({ params }: { params: Promise<{ trainId: string }> }) {
  const { trainId } = await params;
  await dbConnect();
  
  const train = await Train.findById(trainId).populate({
    path: "route",
    populate: { path: "stations.station", select: "name code city" }
  }).lean();
  
  if (!train) return notFound();

  const route = train.route as any;
  if (!route || !route.stations) return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h2 className="text-2xl font-black text-slate-900 mb-4">Route Unavailable</h2>
      <p className="text-slate-500 mb-8">This train has not been assigned a route yet.</p>
      <Link href="/schedule" className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold">Back to Schedules</Link>
    </div>
  );

  let cumulativeHalt = 0;
  const AVG_SPEED_KMH = 60; // 1 km per minute

  const scheduleData = route.stations.map((rs: any, index: number) => {
    const isSource = index === 0;
    const isDest = index === route.stations.length - 1;
    
    const travelTimeMins = Math.round(rs.distanceFromSource * (60 / AVG_SPEED_KMH));
    const arrivalMinsFromStart = travelTimeMins + cumulativeHalt;
    const arrivalTime = isSource ? (train.departureTime || "00:00") : addMinutesToTime(train.departureTime || "00:00", arrivalMinsFromStart);
    const departureTime = isDest ? arrivalTime : addMinutesToTime(arrivalTime, rs.haltDuration || 0);
    cumulativeHalt += (rs.haltDuration || 0);

    return {
      stationName: rs.station.name,
      stationCode: rs.station.code,
      city: rs.station.city,
      distance: rs.distanceFromSource,
      halt: rs.haltDuration || 0,
      arrivalTime: isSource ? "Source" : arrivalTime,
      departureTime: isDest ? "Dest" : departureTime,
      dayOffset: rs.dayOffset
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/schedule" className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">&larr;</span> Back
      </Link>
      
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
            #{train.trainNumber}
          </span>
          <span className="text-sm font-bold text-slate-400">Timetable</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {train.name}
        </h1>
      </div>
      
      {/* Timeline */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/80 rounded-[3rem] p-8 md:p-12 shadow-[0_8px_32px_rgb(0,0,0,0.04)]">
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-12 space-y-12">
          {scheduleData.map((stop: any, idx: number) => {
            const isSource = idx === 0;
            const isDest = idx === scheduleData.length - 1;
            
            return (
              <div key={idx} className="relative pl-12 md:pl-16">
                {/* Node Marker */}
                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                  ${isSource || isDest ? 'bg-slate-900 w-6 h-6 -left-[13px] top-0' : 'bg-slate-300'}`}
                >
                  {(isSource || isDest) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                
                {/* Content */}
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start -mt-1">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{stop.stationName}</h3>
                    <p className="text-slate-500 font-medium text-lg mb-1">{stop.city} <span className="text-slate-300 mx-2">•</span> {stop.stationCode}</p>
                    {!isSource && <p className="text-sm font-bold text-slate-400">Distance: {stop.distance} km</p>}
                  </div>
                  
                  <div className="bg-slate-50/80 rounded-2xl p-4 min-w-[200px] border border-slate-100 flex gap-6">
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Arr</p>
                      <p className={`text-xl font-black ${isSource ? 'text-slate-300' : 'text-slate-900'}`}>{stop.arrivalTime}</p>
                    </div>
                    <div className="w-px bg-slate-200"></div>
                    <div className="flex-1 text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dep</p>
                      <p className={`text-xl font-black ${isDest ? 'text-slate-300' : 'text-slate-900'}`}>{stop.departureTime}</p>
                    </div>
                  </div>
                </div>
                
                {!isDest && (
                  <div className="mt-4 text-xs font-bold text-blue-500 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
                    Halt: {stop.halt} mins
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
