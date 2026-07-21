"use server";

import dbConnect from "@/lib/db";
import { Notification } from "@/models/Notification";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function createNotification(data: { title: string, message: string, type: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") return { error: "Unauthorized" };

    await dbConnect();
    
    await Notification.create({
      title: data.title,
      message: data.message,
      type: data.type,
      isActive: true
    });
    
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteNotification(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") return { error: "Unauthorized" };

    await dbConnect();
    await Notification.findByIdAndDelete(id);
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
