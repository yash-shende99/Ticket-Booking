"use server";

import dbConnect from "@/lib/db";
import { Station } from "@/models/Station";
import { revalidatePath } from "next/cache";

export async function createStation(formData: FormData) {
  try {
    await dbConnect();
    
    const name = formData.get("name") as string;
    const code = formData.get("code") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const platforms = parseInt(formData.get("platforms") as string, 10);
    
    if (!name || !code || !city || !state) {
      return { error: "All fields are required" };
    }
    
    const existing = await Station.findOne({ code: code.toUpperCase() });
    if (existing) {
      return { error: "Station code already exists" };
    }
    
    await Station.create({
      name,
      code: code.toUpperCase(),
      city,
      state,
      platforms: platforms || 1
    });
    
    revalidatePath("/admin/stations");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteStation(stationId: string) {
  try {
    await dbConnect();
    // Check if station is used in any routes before deleting
    const Route = (await import("@/models/Route")).Route;
    const isUsed = await Route.findOne({
      $or: [
        { source: stationId },
        { destination: stationId },
        { "stations.station": stationId }
      ]
    });
    
    if (isUsed) {
      return { error: "Cannot delete station. It is currently being used in a Route." };
    }
    
    await Station.findByIdAndDelete(stationId);
    revalidatePath("/admin/stations");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
