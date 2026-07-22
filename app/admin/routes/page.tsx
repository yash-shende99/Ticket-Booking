import dbConnect from "@/lib/db";
import { Route } from "@/models/Route";
import { Station } from "@/models/Station";
import RouteClient from "./RouteClient";

export const dynamic = 'force-dynamic';

export default async function RoutesAdminPage() {
  await dbConnect();
  
  const routes = await Route.find({})
    .populate("source", "name code")
    .populate("destination", "name code")
    .lean();
    
  const stations = await Station.find({}).sort({ name: 1 }).lean();

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Routes</h1>
          <p className="text-slate-500 mt-2 font-medium">Design and configure train routes and sequential station stops.</p>
        </div>
      </div>
      
      <RouteClient 
        initialRoutes={JSON.parse(JSON.stringify(routes))} 
        stations={JSON.parse(JSON.stringify(stations))} 
      />
    </div>
  );
}
