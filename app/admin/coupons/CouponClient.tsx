"use client";

import { useState } from "react";
import { createCoupon, toggleCoupon, deleteCoupon } from "./actions";
import toast from "react-hot-toast";

export default function CouponClient({ initialCoupons }: { initialCoupons: any[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  
  // Form State
  const [code, setCode] = useState("");
  const [discountPercentage, setDiscount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await createCoupon({
      code,
      discountPercentage: Number(discountPercentage),
      maxDiscount: Number(maxDiscount),
      validUntil
    });

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Coupon created successfully!");
      setCode("");
      setDiscount("");
      setMaxDiscount("");
      setValidUntil("");
      // Force reload since we are modifying state in a complex way
      window.location.reload();
    }
    setLoading(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleCoupon(id, !currentStatus);
    setCoupons(coupons.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
  };

  const handleDelete = async (id: string) => {
    await deleteCoupon(id);
    setCoupons(coupons.filter(c => c._id !== id));
    toast.success("Coupon deleted");
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-8">
      {/* Create New Coupon Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-900 mb-6">Create New Promo Code</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Code</label>
            <input 
              type="text" 
              value={code} 
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER50" 
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Discount %</label>
            <input 
              type="number" 
              value={discountPercentage} 
              onChange={e => setDiscount(e.target.value)}
              min="1" max="100" 
              placeholder="10" 
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Max Discount (₹)</label>
            <input 
              type="number" 
              value={maxDiscount} 
              onChange={e => setMaxDiscount(e.target.value)}
              min="1" 
              placeholder="500" 
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Valid Until</label>
            <input 
              type="date" 
              value={validUntil} 
              onChange={e => setValidUntil(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900" 
            />
          </div>
          <div className="md:col-span-4 flex justify-end mt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Coupon"}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Coupons Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Code</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Discount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Max (₹)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Expiry</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((coupon) => {
                const isExpired = new Date(coupon.validUntil) < new Date();
                return (
                  <tr key={coupon._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900 tracking-wider text-lg">{coupon.code}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{coupon.discountPercentage}% OFF</td>
                    <td className="px-6 py-4 font-bold text-slate-700">₹{coupon.maxDiscount}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">
                        {new Date(coupon.validUntil).toLocaleDateString()}
                      </div>
                      {isExpired && <div className="text-[10px] font-bold text-red-500">EXPIRED</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggle(coupon._id, coupon.isActive)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider transition-colors ${
                          coupon.isActive 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {coupon.isActive ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {confirmDeleteId === coupon._id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-red-600 font-bold mr-1">Sure?</span>
                          <button onClick={() => handleDelete(coupon._id)} className="bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">Yes</button>
                          <button onClick={() => setConfirmDeleteId(null)} className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors">No</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmDeleteId(coupon._id)}
                          className="text-red-500 hover:text-red-700 font-bold text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No promo codes have been generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
