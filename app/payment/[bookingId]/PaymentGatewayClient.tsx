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
  const [simulateFailure, setSimulateFailure] = useState(false);

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (simulateFailure) {
      setLoading(true);
      setProcessingState("Connecting to Bank...");
      await new Promise(r => setTimeout(r, 1500));
      alert("Payment Failed! Bank rejected the transaction (Simulated Failure).");
      setLoading(false);
      return;
    }

    setLoading(true);
    setProcessingState("Initializing Secure Payment...");
    
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Failed to load Razorpay SDK. Please check your connection.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking._id })
      });
      const orderData = await res.json();
      
      if (!orderData.success) {
        alert(orderData.error || "Failed to create order");
        setLoading(false);
        return;
      }

      setLoading(false);

      const options = {
        key: orderData.key_id, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RailConnect",
        description: `Booking ID: ${booking._id.substring(0,8).toUpperCase()}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
           setLoading(true);
           setProcessingState("Payment Successful! Confirming Ticket...");
           try {
             const confirmRes = await confirmPayment(booking._id);
             if (confirmRes?.error) {
               alert(confirmRes.error);
             } else {
               router.push(`/bookings/${booking.pnr}`);
             }
           } catch(e) {
             alert("Error confirming ticket after payment.");
           }
           setLoading(false);
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0f172a" 
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed! Reason: " + response.error.description);
      });

      rzp.open();

    } catch (err) {
      alert("Payment initialization failed.");
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
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} className="w-4 h-4 accent-red-600 cursor-pointer" />
                <span className="text-xs font-bold uppercase tracking-wide">Simulate Failure</span>
              </label>
              <div className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm border ${timeLeft < 60 ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                Time Left: {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet", "EMI"].map((m) => (
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

            {(method === "Credit Card" || method === "Debit Card") && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-slate-500 font-medium mb-2 text-sm">Enter your {method.toLowerCase()} details to securely pay</p>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Card Number</label>
                  <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono" maxLength={19} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Expiry Date</label>
                    <input type="text" placeholder="MM/YY" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono" maxLength={5} required />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">CVV</label>
                    <input type="password" placeholder="•••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono" maxLength={4} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Name on Card</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700" required />
                </div>
              </div>
            )}

            {method === "Net Banking" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-slate-500 font-medium mb-4 text-sm">Select your bank for authorization</p>
                <div className="grid grid-cols-2 gap-3">
                  {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB"].map(bank => (
                    <label key={bank} className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <input type="radio" name="bank" required className="w-4 h-4 accent-indigo-600" />
                      <span className="font-bold text-slate-700">{bank}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {method === "Wallet" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-slate-500 font-medium mb-4 text-sm">Pay using your preferred wallet</p>
                <div className="grid grid-cols-2 gap-3">
                  {["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"].map(wallet => (
                    <label key={wallet} className="flex flex-col items-center justify-center gap-2 p-6 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors group">
                      <input type="radio" name="wallet" required className="w-4 h-4 accent-indigo-600 mb-2" />
                      <span className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{wallet}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {method === "EMI" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-slate-500 font-medium mb-4 text-sm">Choose an EMI tenure</p>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 mb-4" required>
                  <option value="">Select Bank...</option>
                  <option value="hdfc">HDFC Bank Credit Card</option>
                  <option value="sbi">SBI Credit Card</option>
                  <option value="icici">ICICI Bank Credit Card</option>
                  <option value="bajaj">Bajaj Finserv EMI Card</option>
                </select>
                <div className="grid grid-cols-1 gap-3">
                  {["3 Months @ 12% p.a.", "6 Months @ 14% p.a.", "9 Months @ 15% p.a.", "12 Months @ 15% p.a."].map(tenure => (
                    <label key={tenure} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="tenure" required className="w-4 h-4 accent-indigo-600" />
                        <span className="font-bold text-slate-700">{tenure.split('@')[0]}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">@{tenure.split('@')[1]}</span>
                    </label>
                  ))}
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
