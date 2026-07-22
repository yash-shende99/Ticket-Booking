"use server";

import dbConnect from "@/lib/db";
import { Route } from "@/models/Route";
import { Train } from "@/models/Train";
import { revalidatePath } from "next/cache";

export async function createRoute(data: any) {
  try {
    await dbConnect();
    
    if (!data.routeName || !data.source || !data.destination || !data.stations || data.stations.length < 2) {
      return { error: "Invalid route data. A route must have a name, source, destination, and at least 2 stations." };
    }
    
    await Route.create(data);
    
    revalidatePath("/admin/routes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateRoute(routeId: string, data: any) {
  try {
    await dbConnect();
    
    if (!data.routeName || !data.source || !data.destination || !data.stations || data.stations.length < 2) {
      return { error: "Invalid route data." };
    }
    
    await Route.findByIdAndUpdate(routeId, data);
    
    revalidatePath("/admin/routes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteRoute(routeId: string) {
  try {
    await dbConnect();
    
    // Check if route is used by any active train
    const isUsed = await Train.findOne({ route: routeId });
    if (isUsed) {
      return { error: "Cannot delete route. It is currently assigned to a Train." };
    }
    
    await Route.findByIdAndDelete(routeId);
    revalidatePath("/admin/routes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
