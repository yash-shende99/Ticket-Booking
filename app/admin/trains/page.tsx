import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import { Route } from "@/models/Route";
import TrainClient from "./TrainClient";

export const dynamic = 'force-dynamic';

export default async function TrainsAdminPage() {
  await dbConnect();
  
  const trains = await Train.find({})
    .populate({
      path: "route",
      populate: [
        { path: "source", select: "name code" },
        { path: "destination", select: "name code" }
      ]
    })
    .lean();
    
  const routes = await Route.find({})
    .populate("source", "name code")
    .populate("destination", "name code")
    .lean();

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Trains</h1>
          <p className="text-slate-500 mt-2 font-medium">Configure trains, assign routes, and manage coach capacities.</p>
        </div>
      </div>
      
      <TrainClient 
        initialTrains={JSON.parse(JSON.stringify(trains))} 
        routes={JSON.parse(JSON.stringify(routes))} 
      />
    </div>
  );
}
