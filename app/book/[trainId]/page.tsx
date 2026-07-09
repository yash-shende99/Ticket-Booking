import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import { notFound } from "next/navigation";
import BookingForm from "./BookingForm";
import Link from "next/link";
import { Route } from "@/models/Route";
import { Station } from "@/models/Station";

export default async function BookTrainPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ trainId: string }>;
  searchParams: Promise<{ date: string; class: string }>;
}) {
  await dbConnect();
  
  const { trainId } = await params;
  const { date: journeyDate, class: preselectedClass, source, dest } = await searchParams;

  let train;
  try {
    // Populate the route and stations to display them
    train = await Train.findById(trainId)
      .populate({
        path: 'route',
        model: Route,
        populate: {
          path: 'stations.station',
          model: Station
        }
      })
      .lean();
  } catch (error: any) {
    return <div>Error fetching train details: {error.message}</div>;
  }

  if (!train) {
    return <div>Train not found in database.</div>;
  }

  let sourceObj = train.route.stations[0];
  let destObj = train.route.stations[train.route.stations.length - 1];

  if (source && dest) {
    const s = train.route.stations.find((s:any) => s.station._id.toString() === source);
    const d = train.route.stations.find((s:any) => s.station._id.toString() === dest);
    if (s && d) {
      sourceObj = s;
      destObj = d;
    }
  }

  const totalDistance = Math.abs(destObj.distanceFromSource - sourceObj.distanceFromSource);
  const basePrice = Math.floor(train.basePricePerKm * totalDistance) || 50;

  // Convert the complex mongoose document to a simple object we can pass to the client component
  const safeTrain = {
    _id: train._id.toString(),
    name: train.name,
    trainNumber: train.trainNumber,
    coaches: train.coaches.map((c: any) => {
      let multiplier = 1;
      if (c.coachClass === "1A") multiplier = 4;
      if (c.coachClass === "2A") multiplier = 3;
      if (c.coachClass === "3A") multiplier = 2;
      if (c.coachClass === "SL") multiplier = 1.5;
      
      let desc = "Unreserved";
      if (c.coachClass === "1A") desc = "First Class AC";
      if (c.coachClass === "2A") desc = "2 Tier AC";
      if (c.coachClass === "3A") desc = "3 Tier AC";
      if (c.coachClass === "SL") desc = "Sleeper Class";
      
      return {
        id: c.coachClass,
        name: c.coachClass,
        price: Math.floor(basePrice * multiplier),
        desc
      };
    })
  };

  // Compute Arrival Time
  const [depHours, depMins] = train.departureTime.split(':').map(Number);
  const originDate = new Date();
  originDate.setHours(depHours, depMins, 0, 0);

  // Source departure time
  const sourceTimeOffsetMs = (sourceObj.distanceFromSource / 60) * 60 * 60 * 1000; 
  const sourceDepartureDate = new Date(originDate.getTime() + sourceTimeOffsetMs);
  const computedDepartureTime = `${sourceDepartureDate.getHours().toString().padStart(2, '0')}:${sourceDepartureDate.getMinutes().toString().padStart(2, '0')}`;

  // Destination arrival time
  const destTimeOffsetMs = (destObj.distanceFromSource / 60) * 60 * 60 * 1000;
  const destArrivalDate = new Date(originDate.getTime() + destTimeOffsetMs);
  const computedArrivalTime = `${destArrivalDate.getHours().toString().padStart(2, '0')}:${destArrivalDate.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="w-12 h-12 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/80 shadow-sm hover:bg-white/60 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-slate-700">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{safeTrain.name}</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">Train No. {safeTrain.trainNumber}</p>
        </div>
      </div>

      {/* Journey Overview (Horizontal Layout) */}
      <div className="bg-white/40 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_8px_32px_rgb(0,0,0,0.03)] border border-white/80 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0 border-4 border-[#e8eaec]">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{sourceObj.station.name || "Source Station"}</p>
            <p className="text-slate-500 font-medium tracking-wide">Departs • {computedDepartureTime}</p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center px-8 relative">
          <div className="w-full h-[2px] border-t-2 border-dashed border-slate-300"></div>
          <div className="absolute bg-[#111] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            Express
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-2xl font-black text-slate-900">{destObj.station.name || "Destination Station"}</p>
            <p className="text-slate-500 font-medium tracking-wide">Arrives • {computedArrivalTime}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0 border-4 border-[#e8eaec]">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Booking Form (Self-managed 2 column split) */}
      <BookingForm train={safeTrain} journeyDate={journeyDate} preselectedClass={preselectedClass} />

    </div>
  );
}
