import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import CouponClient from "./CouponClient";

export const dynamic = 'force-dynamic';

export default async function CouponsAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/admin/login");
  }

  await dbConnect();
  
  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    
  const plainCoupons = coupons.map(c => ({
    _id: c._id.toString(),
    code: c.code,
    discountPercentage: c.discountPercentage,
    maxDiscount: c.maxDiscount,
    validUntil: c.validUntil,
    isActive: c.isActive,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Coupons & Promos</h1>
        <p className="text-slate-500 font-medium mt-1">Create and manage discount codes for your customers.</p>
      </div>

      <CouponClient initialCoupons={plainCoupons} />
    </div>
  );
}
