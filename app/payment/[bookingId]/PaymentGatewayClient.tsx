"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { confirmPayment } from "@/app/actions";

export default function PaymentGatewayClient({ booking }: { booking: any }) {
  const router = useRouter();
  const [method, setMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [processingState, setProcessingState] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Payment session expired!");
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setProcessingState("Connecting to Bank...");
    
    // Simulate realistic delay
    await new Promise(r => setTimeout(r, 1500));
    setProcessingState("Processing Payment...");
    
    await new Promise(r => setTimeout(r, 1500));
    setProcessingState("Securing Seats...");
    
    try {
      const res = await confirmPayment(booking._id);
      if (res?.error) {
        alert(res.error);
        setLoading(false);
      } else {
        setProcessingState("Payment Successful!");
        await new Promise(r => setTimeout(r, 800));
        router.push(`/bookings/${booking.pnr}`);
      }
    } catch (err) {
      alert("Payment Failed. Try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-black text-slate-900 animate-pulse">{processingState}</h2>
        <p className="text-slate-500 mt-2 font-medium">Please do not refresh or hit back</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Column: Payment Methods */}
      <div className="flex-1 space-y-6">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-900">Payment Gateway</h2>
            <div className={`px-4 py-1 rounded-full text-sm font-bold shadow-sm ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {["UPI", "Credit Card", "Net Banking"].map((m) => (
              <button 
                key={m}
                onClick={() => setMethod(m)}
                className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold transition-all border-2 ${method === m ? "border-slate-900 bg-slate-50 shadow-md text-slate-900" : "border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={handlePayment} className="space-y-6">
            {method === "UPI" && (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
                  <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-4 flex items-center justify-center">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=irctc@sbi&am=${booking.pricePaid}&cu=INR`} alt="UPI QR" className="w-full h-full opacity-80" />
                  </div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Scan to Pay</p>
                  <p className="text-xs text-slate-400 font-medium">OR</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">UPI ID</label>
                  <input type="text" placeholder="username@bank" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium text-slate-800" required />
                </div>
              </div>
            )}

            {method === "Credit Card" && (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Card Number</label>
                  <input type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength={19} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium text-slate-800 tracking-widest" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Valid Thru</label>
                    <input type="text" placeholder="MM/YY" maxLength={5} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium text-slate-800" required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">CVV</label>
                    <input type="password" placeholder="***" maxLength={3} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium text-slate-800" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name on Card</label>
                  <input type="text" placeholder="JOHN DOE" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium text-slate-800 uppercase" required />
                </div>
              </div>
            )}

            {method === "Net Banking" && (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Select Bank</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-medium text-slate-800">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              </div>
            )}

            <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 px-6 rounded-2xl transition-colors mt-8 text-lg shadow-xl shadow-slate-900/20">
              Pay ₹{booking.pricePaid} Securely
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Invoice/Summary */}
      <div className="w-full md:w-[350px] shrink-0">
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200 sticky top-6">
          <h3 className="font-black text-slate-900 mb-6 text-lg tracking-tight border-b border-slate-200 pb-4">Transaction Details</h3>
          
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Train</p>
              <p className="font-bold text-slate-800">{booking.trainId.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Booking ID</p>
              <p className="font-bold text-slate-800 text-sm tracking-widest">{booking._id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Passengers</p>
              <p className="font-bold text-slate-800">{booking.passengers.length} Persons</p>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-6">
             <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-2">
                <span>Base Fare</span>
                <span>₹{booking.fareDetails.baseFare}</span>
             </div>
             <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-2">
                <span>Taxes & Fees</span>
                <span>₹{booking.fareDetails.gst + booking.fareDetails.reservationCharges + booking.fareDetails.convenienceFee}</span>
             </div>
             {booking.fareDetails.discount > 0 && (
                <div className="flex justify-between items-center text-sm font-bold text-emerald-500 mb-2">
                  <span>Discounts</span>
                  <span>- ₹{booking.fareDetails.discount}</span>
               </div>
             )}
          </div>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <div className="flex justify-between items-end">
              <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">Total Pay</span>
              <span className="text-3xl font-black text-slate-900">₹{booking.pricePaid}</span>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">100% Secure Payment</span>
          </div>
        </div>
      </div>
    </div>
  );
}
