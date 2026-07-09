"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/actions";

export default function BookingForm({ train }: { train: any }) {
  const router = useRouter();
  const [seatClass, setSeatClass] = useState("1AC");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("trainId", train._id.toString());
    formData.append("seatClass", seatClass);
    
    try {
      await createBooking(formData);
      router.push("/bookings");
    } catch (error) {
      alert("Failed to book ticket. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white mt-4">
      <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Select Class</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "1AC", name: "1AC", price: train.price1AC, desc: "First Class AC" },
          { id: "2AC", name: "2AC", price: train.price2AC, desc: "2 Tier AC" },
          { id: "Sleeper", name: "Sleeper", price: train.priceSleeper, desc: "Non-AC Sleeper" },
          { id: "General", name: "General", price: train.priceGeneral, desc: "Unreserved" },
        ].map((cls) => (
          <div 
            key={cls.id}
            onClick={() => setSeatClass(cls.id)}
            className={`rounded-2xl p-4 cursor-pointer transition-all text-center border-2 ${seatClass === cls.id ? "border-slate-900 bg-slate-50" : "border-slate-100 bg-white hover:border-slate-300"}`}
          >
            <h3 className="font-bold text-slate-900">{cls.name}</h3>
            <p className="text-slate-600 font-bold mt-1 text-sm">${cls.price}</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">{cls.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Passenger Info</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input name="passengerName" type="text" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium text-slate-800 placeholder-slate-400" placeholder="Full Name" required />
          </div>
          <div>
            <input name="passengerAge" type="number" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium text-slate-800 placeholder-slate-400" placeholder="Age" min="1" max="120" required />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-full transition-colors mt-2 disabled:opacity-50 text-lg shadow-lg">
            {loading ? "Confirming..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
