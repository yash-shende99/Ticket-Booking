import dbConnect from "@/lib/db";
import Link from "next/link";
import TrainSearch from "@/components/TrainSearch";
import HomePageSections from "@/components/HomePageSections";
import { Route } from "@/models/Route";
import { Station } from "@/models/Station";

export default async function Home() {
  await dbConnect();
  
  // Fetch a few real routes for the Popular Routes section
  const routesData = await Route.find({})
    .populate('source')
    .populate('destination')
    .limit(4)
    .lean();

  const popularRoutes = routesData.map((route: any) => ({
    name: `${route.source?.name} - ${route.destination?.name}`,
    sourceId: route.source?._id.toString(),
    destId: route.destination?._id.toString()
  }));
  
  return (
    <div className="max-w-7xl mx-auto md:max-w-none space-y-6">
      
      {/* Header Area */}
      <div className="pt-4 pb-2 md:py-8 text-center md:text-left">
        <h2 className="text-slate-600 font-medium mb-1 tracking-wide text-sm">Hi, Welcome</h2>
        <h1 className="text-4xl md:text-5xl font-black text-[#111] tracking-tight leading-[1.1]">
          Explore New<br />Train Trips
        </h1>
      </div>

      {/* Advanced Train Search Component */}
      <TrainSearch />

      {/* Modern Home Page Layout Sections */}
      <HomePageSections popularRoutes={popularRoutes} />
      
    </div>
  );
}
