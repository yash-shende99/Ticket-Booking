"use server";

import dbConnect from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function createCoupon(data: { code: string, discountPercentage: number, maxDiscount: number, validUntil: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") return { error: "Unauthorized" };

    await dbConnect();
    
    // Check if exists
    const exists = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (exists) return { error: "Coupon code already exists!" };

    await Coupon.create({
      code: data.code.toUpperCase(),
      discountPercentage: data.discountPercentage,
      maxDiscount: data.maxDiscount,
      validUntil: new Date(data.validUntil),
      isActive: true
    });
    
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function toggleCoupon(id: string, isActive: boolean) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") return { error: "Unauthorized" };

    await dbConnect();
    await Coupon.findByIdAndUpdate(id, { isActive });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCoupon(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") return { error: "Unauthorized" };

    await dbConnect();
    await Coupon.findByIdAndDelete(id);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
