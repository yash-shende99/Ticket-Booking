import { searchTrains } from "@/lib/searchEngine";
import { getSeatInventory } from "@/lib/inventoryEngine";
import { Station } from "@/models/Station";
import Link from "next/link";
import SearchFilters from "@/components/SearchFilters";

export default async function SearchResultsPage({
  searchParams
}: {
  searchParams: { source: string; dest: string; date: string; ac?: string; available?: string; morning?: string }
}) {
  const { source, dest, date, ac, available, morning } = await searchParams;
  
  if (!source || !dest || !date) {
    return <div className="p-10 text-center">Invalid search parameters.</div>;
  }

  const journeyDate = new Date(date);
  
  // Fetch station names for display
  const sourceStation = await Station.findById(source).lean();
  const destStation = await Station.findById(dest).lean();

  const trains = await searchTrains(source, dest, journeyDate);

  // Enhance trains with real-time seat inventory
  const enhancedTrains = await Promise.all(
    trains.map(async (train) => {
      const coachesWithInventory = await Promise.all(
        train.coaches.map(async (coach: any) => {
          // multiplier for baseFare: 1A=4x, 2A=3x, 3A=2x, SL=1.5x, GN=1x
          let multiplier = 1;
          if (coach.coachClass === "1A") multiplier = 4;
          if (coach.coachClass === "2A") multiplier = 3;
          if (coach.coachClass === "3A") multiplier = 2;
          if (coach.coachClass === "SL") multiplier = 1.5;

          const fare = Math.floor(train.baseFare * multiplier);

          const inv = await getSeatInventory(
            train._id,
            train._id, // Just using trainId for routeId for simplicity as route is in train
            journeyDate,
            coach.coachClass,
            coach.capacity,
            fare
          );
          
          return {
            class: coach.coachClass,
            fare,
            status: inv.status,
            count: inv.count,
            color: inv.color
          };
        })
      );
      return { ...train, inventory: coachesWithInventory };
    })
  );

  // Apply Filters
  let filteredTrains = enhancedTrains;

  if (ac === "true") {
    filteredTrains = filteredTrains.filter(t => 
      t.inventory.some((inv: any) => inv.class.includes("A"))
    );
    // Also remove non-AC coaches from display
    filteredTrains = filteredTrains.map(t => ({
      ...t,
      inventory: t.inventory.filter((inv: any) => inv.class.includes("A"))
    }));
  }

  if (available === "true") {
    filteredTrains = filteredTrains.filter(t => 
      t.inventory.some((inv: any) => inv.status === "AVAILABLE" && inv.count > 0)
    );
  }

  if (morning === "true") {
    filteredTrains = filteredTrains.filter(t => {
      const depHour = parseInt(t.departureTime.split(":")[0]);
      return depHour >= 6 && depHour < 12;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#111] rounded-[2rem] p-8 text-white mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-black mb-2 flex items-center gap-4">
              {sourceStation?.name} 
              <span className="text-white/50 text-xl font-medium">to</span> 
              {destStation?.name}
            </h1>
            <p className="text-white/70 font-semibold tracking-wide">
              {filteredTrains.length} Trains found • {journeyDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link href="/" className="mt-6 md:mt-0 bg-white text-[#111] px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors">
            Modify Search
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <SearchFilters />
        </div>

        {/* Train Results */}
        <div className="lg:col-span-3 space-y-6">
          {filteredTrains.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Trains Found</h2>
              <p className="text-slate-500 font-medium">Try modifying your search date or stations.</p>
            </div>
          ) : (
            filteredTrains.map(train => (
              <div key={train._id} className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                
                {/* Train Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{train.name}</h2>
                    <p className="text-slate-500 font-bold text-sm tracking-widest mt-1"># {train.trainNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full inline-block">Runs Daily</p>
                  </div>
                </div>

                {/* Timing */}
                <div className="flex items-center justify-between mb-8 bg-slate-50 rounded-2xl p-4">
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{train.departureTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{sourceStation?.code}</p>
                  </div>
                  <div className="flex-1 px-8 flex flex-col items-center relative">
                    <p className="text-xs font-bold text-slate-400 absolute -top-1">{train.duration}</p>
                    <div className="w-full h-[2px] border-t-2 border-dashed border-slate-300 relative mt-3">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 text-slate-400 border border-slate-200 shadow-sm">
                        🚆
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{train.arrivalTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{destStation?.code}</p>
                  </div>
                </div>

                {/* Availability Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {train.inventory.map((inv: any, idx: number) => (
                    <Link 
                      href={`/book/${train._id}?class=${inv.class}&date=${date}&source=${source}&dest=${dest}`} 
                      key={idx} 
                      className={`border-2 rounded-2xl p-3 cursor-pointer transition-all hover:-translate-y-1 block text-left ${inv.color}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-slate-800">{inv.class}</span>
                        <span className="font-bold text-slate-800 text-sm">₹{inv.fare}</span>
                      </div>
                      <div className="text-sm font-bold uppercase tracking-wider">
                        {inv.status} {inv.count > 0 && inv.count}
                      </div>
                    </Link>
                  ))}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
