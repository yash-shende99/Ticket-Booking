"use server";

import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function processRefund(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return { error: "Unauthorized" };
    }

    await dbConnect();
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return { error: "Booking not found" };
    }
    
    if (booking.status !== "CANCELLED") {
      return { error: "Cannot refund a ticket that is not cancelled." };
    }

    booking.paymentStatus = "REFUNDED";
    await booking.save();
    
    revalidatePath("/admin/refunds");
    // Also revalidate dashboard where pending refunds count is shown
    revalidatePath("/admin");
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
