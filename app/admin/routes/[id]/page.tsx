import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Route } from "@/models/Route";
import { Station } from "@/models/Station";
import RouteDetailClient from "./RouteDetailClient";

export const dynamic = 'force-dynamic';

export default async function RouteDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  await dbConnect();
  
  const route = await Route.findById(params.id).populate('stations.station', 'name code').lean();
  const stations = await Station.find({ isActive: true }).sort({ name: 1 }).lean();
  
  if (!route) {
    redirect("/admin/routes");
  }

  // Need to sanitize plain object for Client Component
  const plainRoute = JSON.parse(JSON.stringify(route));
  const plainStations = JSON.parse(JSON.stringify(stations));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Update Route</h1>
        <p className="text-slate-500 font-medium mt-1">Modify the route details and station path.</p>
      </div>

      <RouteDetailClient route={plainRoute} stations={plainStations} />
    </div>
  );
}
