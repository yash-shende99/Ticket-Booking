"use server";

import dbConnect from "@/lib/db";
import { Train } from "@/models/Train";
import { revalidatePath } from "next/cache";

export async function createTrain(data: any) {
  try {
    await dbConnect();
    
    const existing = await Train.findOne({ trainNumber: data.trainNumber });
    if (existing) {
      return { error: "Train number already exists" };
    }
    
    await Train.create(data);
    
    revalidatePath("/admin/trains");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteTrain(trainId: string) {
  try {
    await dbConnect();
    await Train.findByIdAndDelete(trainId);
    revalidatePath("/admin/trains");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
