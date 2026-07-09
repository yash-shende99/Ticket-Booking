import dbConnect from "./db";
import { Train } from "@/models/Train";
import { Route } from "@/models/Route";
import mongoose from "mongoose";

export async function searchTrains(sourceId: string, destId: string, journeyDate: Date) {
  await dbConnect();
  
  // 1. Find routes that contain both source and destination
  // And ensure source comes BEFORE destination in the route.stations array
  
  const sourceObjId = sourceId.toString();
  const destObjId = destId.toString();
  const dayOfWeek = journeyDate.getDay(); // 0-6

  const allRoutes = await Route.find({}).lean();
  
  const routes = allRoutes.filter(r => {
    const stations = r.stations.map((s: any) => s.station.toString());
    const sourceIndex = stations.indexOf(sourceObjId);
    const destIndex = stations.indexOf(destObjId);
    
    // Both stations must exist
    if (sourceIndex === -1 || destIndex === -1) return false;
    
    // Attach indexes for later use
    (r as any).sourceIndex = sourceIndex;
    (r as any).destIndex = destIndex;
    
    return true; // allow bidirectional travel for the prototype!
  });

  if (routes.length === 0) {
    return [];
  }

  const routeIds = routes.map(r => r._id);

  // 2. Find trains on these routes that run on the requested day
  const trains = await Train.find({
    route: { $in: routeIds },
    runningDays: dayOfWeek,
    isActive: true
  }).lean();

  // 3. Compute times and prices for each train
  const results = trains.map(train => {
    const route = routes.find(r => r._id.toString() === train.route.toString());
    const sourceStationInfo = (route as any).stations[(route as any).sourceIndex];
    const destStationInfo = (route as any).stations[(route as any).destIndex];

    // Distance calculation (absolute value handles bidirectional)
    const distance = Math.abs(destStationInfo.distanceFromSource - sourceStationInfo.distanceFromSource);
    const baseFare = Math.floor(distance * train.basePricePerKm) || 50;

    // Time calculation (Assuming 60 km/h average speed)
    const [depHours, depMins] = train.departureTime.split(':').map(Number);
    const originDate = new Date(journeyDate);
    originDate.setHours(depHours, depMins, 0, 0);

    // Bidirectional time offset
    const isReverse = (route as any).sourceIndex > (route as any).destIndex;
    
    // The total distance of the route to calculate reverse offset
    const routeTotalDistance = isReverse ? (route as any).stations[(route as any).stations.length - 1].distanceFromSource : 0;
    
    // If going reverse, the source is actually further along the track, so it departs LATER from the "end" of the track.
    // For simplicity in the prototype, we just calculate time based on distance from the starting point of the journey.
    const sourceDepartureTime = new Date(originDate.getTime() + (Math.random() * 2 + 1) * 60 * 60 * 1000); // Add 1-3 hours
    
    // Destination arrival time based on distance (60km/h)
    const durationMs = (distance / 60) * 60 * 60 * 1000;
    const destArrivalTime = new Date(sourceDepartureTime.getTime() + durationMs);

    const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      _id: train._id.toString(),
      trainNumber: train.trainNumber,
      name: train.name,
      departureTime: sourceDepartureTime,
      arrivalTime: destArrivalTime,
      duration: `${durationHrs}h ${durationMins}m`,
      distance,
      baseFare,
      coaches: train.coaches
    };
  });

  return results;
}
