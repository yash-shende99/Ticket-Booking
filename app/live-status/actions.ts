"use server";

import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import { Route } from "@/models/Route";
import { calculateLiveStatus } from "@/lib/liveEngine";
import { Station } from "@/models/Station";

export async function fetchLiveStatus(trainId: string) {
  await dbConnect();
  
  // Ensure models are registered
  const _ = Station;

  const train = await Train.findById(trainId).populate({
    path: "route",
    populate: { path: "stations.station", select: "name code" }
  }).lean();
  
  if (!train || !train.route) return null;

  const liveData = calculateLiveStatus(train, train.route);
  
  return {
    trainName: train.name,
    trainNumber: train.trainNumber,
    ...liveData
  };
}
