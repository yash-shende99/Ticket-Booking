import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import Link from "next/link";

export default async function PaymentHistoryPage() {
  await dbConnect();
  // Fetch all bookings for simulation (normally filtered by userId)
  const bookings = await Booking.find().populate("trainId").sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment History</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your transactions, refunds, and invoices.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Transaction / PNR</th>
                <th className="p-4">Date</th>
                <th className="p-4">Train</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b: any) => (
                <tr key={b._id.toString()} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-900">{b.pnr}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {b._id.toString().slice(-8).toUpperCase()}</p>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600">
                    {new Date(b.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-700 text-sm">{b.trainId?.name || 'Unknown Train'}</p>
                    <p className="text-xs text-slate-400">Class: {b.seatClass}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-black text-slate-900">₹{b.pricePaid}</p>
                    {b.paymentStatus === "REFUNDED" && b.fareDetails?.refundAmount >= 0 && (
                      <p className="text-xs font-bold text-red-500 mt-0.5">-₹{b.fareDetails.cancellationFee} (Fee)</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                      b.paymentStatus === 'REFUNDED' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex gap-2">
                      {b.status !== "PENDING" && (
                        <Link href={`/bookings/${b.pnr}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                          View
                        </Link>
                      )}
                      {b.paymentStatus === "PENDING" && (
                        <Link href={`/payment/${b._id.toString()}`} className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
                          Pay Now
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
