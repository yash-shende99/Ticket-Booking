"use server";

import dbConnect from "@/lib/db";
import { Coupon } from "@/models/Coupon";

export async function validateCoupon(code: string, subtotal: number) {
  try {
    await dbConnect();

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      validUntil: { $gte: new Date() },
    }).lean();

    if (!coupon) {
      return { error: "Invalid or expired coupon code." };
    }

    // Calculate discount
    const rawDiscount = subtotal * (coupon.discountPercentage / 100);
    const discountAmount = Math.min(rawDiscount, coupon.maxDiscount);

    return {
      success: true,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      maxDiscount: coupon.maxDiscount,
      discountAmount: Math.round(discountAmount * 100) / 100,
    };
  } catch (error: any) {
    return { error: error.message };
  }
}
