import dbConnect from "@/lib/db";
import { Station } from "@/models/Station";
import StationClient from "./StationClient";

export const dynamic = 'force-dynamic';

export default async function StationsAdminPage() {
  await dbConnect();
  const stations = await Station.find({}).sort({ name: 1 }).lean();

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Stations</h1>
          <p className="text-slate-500 mt-2 font-medium">Add, remove, and configure railway stations across the network.</p>
        </div>
      </div>
      
      <StationClient initialStations={JSON.parse(JSON.stringify(stations))} />
    </div>
  );
}
