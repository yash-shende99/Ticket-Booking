"use client";

import { useState } from "react";
import { processRefund } from "./actions";
import toast from "react-hot-toast";

export default function RefundClient({ initialRefunds }: { initialRefunds: any[] }) {
  const [refunds, setRefunds] = useState(initialRefunds);
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmRefundId, setConfirmRefundId] = useState<string | null>(null);

  const handleRefund = async (bookingId: string) => {
    setLoading(bookingId);
    const res = await processRefund(bookingId);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      setRefunds(refunds.map(r => r._id === bookingId ? { ...r, paymentStatus: 'REFUNDED' } : r));
      toast.success("Refund processed successfully");
    }
    setLoading(null);
    setConfirmRefundId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">PNR</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelled On</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {refunds.map((refund) => (
              <tr key={refund._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-black text-slate-900">{refund.pnr}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{refund.user.name}</div>
                  <div className="text-xs font-medium text-slate-500">{refund.user.email}</div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {new Date(refund.cancelledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-900">
                  ₹{refund.amount.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${
                    refund.paymentStatus === 'REFUNDED' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {refund.paymentStatus === 'REFUNDED' ? 'COMPLETED' : 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {refund.paymentStatus !== 'REFUNDED' ? (
                    confirmRefundId === refund._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-red-600 font-bold mr-1">Confirm?</span>
                        <button onClick={() => handleRefund(refund._id)} disabled={loading === refund._id} className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">Yes</button>
                        <button onClick={() => setConfirmRefundId(null)} disabled={loading === refund._id} className="bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-300 transition-colors">No</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmRefundId(refund._id)}
                        disabled={loading === refund._id}
                        className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        Process
                      </button>
                    )
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Processed</span>
                  )}
                </td>
              </tr>
            ))}
            {refunds.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No refunds pending.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
