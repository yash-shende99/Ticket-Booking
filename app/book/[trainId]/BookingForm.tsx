"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/app/actions";
import { validateCoupon } from "@/app/actions/coupon";
import toast from "react-hot-toast";

export default function BookingForm({ 
  train, 
  journeyDate, 
  preselectedClass 
}: { 
  train: any;
  journeyDate?: string;
  preselectedClass?: string;
}) {
  const router = useRouter();
  const [seatClass, setSeatClass] = useState(() => {
    if (preselectedClass && train.coaches.some((c:any) => c.id === preselectedClass)) {
      return preselectedClass;
    }
    return train.coaches[0]?.id || "1A";
  });
  
  const [passengers, setPassengers] = useState([
    {
      name: "", age: "", gender: "Male", nationality: "Indian",
      idType: "Aadhaar", idNumber: "", mealPreference: "None", berthPreference: "No Preference",
      isSeniorCitizen: false, isStudent: false, isDisabled: false, isInfant: false
    }
  ]);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key:number]: string}>({});

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discountAmount: number; discountPercentage: number; maxDiscount: number} | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const addPassenger = () => {
    if (passengers.length >= 6) {
      toast.error("Maximum 6 passengers allowed per booking.");
      return;
    }
    setPassengers([...passengers, {
      name: "", age: "", gender: "Male", nationality: "Indian",
      idType: "Aadhaar", idNumber: "", mealPreference: "None", berthPreference: "No Preference",
      isSeniorCitizen: false, isStudent: false, isDisabled: false, isInfant: false
    }]);
  };

  const removePassenger = (index: number) => {
    if (passengers.length === 1) return;
    const newPass = [...passengers];
    newPass.splice(index, 1);
    setPassengers(newPass);
  };

  const updatePassenger = (index: number, field: string, value: any) => {
    const newPass = [...passengers];
    const p = newPass[index];
    
    // Clear errors when updating fields
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);

    if (field === 'isSeniorCitizen' && value === true) {
      const age = Number(p.age);
      if (p.gender === 'Male' && age < 60) {
        setErrors({ ...errors, [index]: 'Male Senior Citizens must be 60 or above.' });
        return;
      }
      if ((p.gender === 'Female' || p.gender === 'Transgender') && age < 58) {
        setErrors({ ...errors, [index]: 'Female/Transgender Senior Citizens must be 58 or above.' });
        return;
      }
      p.isSeniorCitizen = true;
      p.isStudent = false;
      p.isDisabled = false;
      p.isInfant = false;
    } else if (field === 'isInfant' && value === true) {
      const age = Number(p.age);
      if (age >= 5 || !p.age) {
        setErrors({ ...errors, [index]: 'Infants must be under 5 years old.' });
        return;
      }
      p.isInfant = true;
      p.isSeniorCitizen = false;
      p.isStudent = false;
      p.isDisabled = false;
    } else if (field === 'isStudent' && value === true) {
      p.isStudent = true;
      p.isSeniorCitizen = false;
      p.isDisabled = false;
      p.isInfant = false;
    } else if (field === 'isDisabled' && value === true) {
      p.isDisabled = true;
      p.isSeniorCitizen = false;
      p.isStudent = false;
      p.isInfant = false;
    } else {
      (p as any)[field] = value;
    }
    
    setPassengers(newPass);
  };

  // Fare Calculation
  const selectedCoach = train.coaches.find((c:any) => c.id === seatClass);
  const basePricePerSeat = selectedCoach ? selectedCoach.price : 0;
  
  // Calculate Base Fare
  let baseFare = 0;
  let discount = 0;
  
  passengers.forEach(p => {
    const age = Number(p.age);
    if (p.age && age < 5) {
      // Infants travel free
      baseFare += 0;
    } else {
      baseFare += basePricePerSeat;
      // Calculate discounts
      if (p.isSeniorCitizen && age >= 60) {
        discount += basePricePerSeat * 0.40; // 40% off
      } else if (p.isStudent) {
        discount += basePricePerSeat * 0.20; // 20% off
      } else if (p.isDisabled) {
        discount += basePricePerSeat * 0.50; // 50% off
      }
    }
  });

  const reservationCharges = passengers.filter(p => !(p.age && Number(p.age) < 5)).length * 40;
  const gst = baseFare * 0.05; // 5% GST on base fare
  const convenienceFee = 35; // Flat fee
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const totalFare = Math.max(0, baseFare + reservationCharges + gst + convenienceFee - discount - couponDiscount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }
    setCouponLoading(true);
    const subtotal = baseFare + reservationCharges + gst + convenienceFee - discount;
    const res = await validateCoupon(couponCode, subtotal);
    if (res.error) {
      toast.error(res.error);
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon({ code: res.code!, discountAmount: res.discountAmount!, discountPercentage: res.discountPercentage!, maxDiscount: res.maxDiscount! });
      toast.success(`Coupon "${res.code}" applied! You save ₹${res.discountAmount!.toFixed(0)}`);
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.success("Coupon removed.");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Extract form data synchronously before any await!
    const formData = new FormData(e.currentTarget);
    
    setLoading(true);
    
    // Validate
    const invalidAge = passengers.find(p => !p.age || Number(p.age) <= 0);
    if (invalidAge) {
      toast.error("Please enter valid ages for all passengers.");
      setLoading(false);
      return;
    }
    const invalidName = passengers.find(p => !p.name || p.name.length < 2);
    if (invalidName) {
      toast.error("Please enter valid names for all passengers.");
      setLoading(false);
      return;
    }
    // specific validations handled inline during checkbox click

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      toast.error("Failed to load Razorpay SDK. Please check your connection.");
      setLoading(false);
      return;
    }

    formData.append("trainId", train._id.toString());
    formData.append("seatClass", seatClass);
    if (journeyDate) formData.append("journeyDate", journeyDate);
    
    // Serialize complex data
    formData.append("passengers", JSON.stringify(passengers));
    formData.append("fareDetails", JSON.stringify({ baseFare, reservationCharges, gst, convenienceFee, discount: discount + couponDiscount, totalFare }));
    formData.append("pricePaid", totalFare.toString());
    if (appliedCoupon) formData.append("couponCode", appliedCoupon.code);
    if (emergencyContact) formData.append("emergencyContact", emergencyContact);
    
    try {
      const res = await createBooking(formData);
      if (res?.error) {
        toast.error(res.error);
        setLoading(false);
        return;
      } 
      
      const bookingId = res?.bookingId;
      if (!bookingId) {
         toast.error("Failed to secure booking.");
         setLoading(false);
         return;
      }

      // Generate Razorpay Order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        toast.error(orderData.error || "Failed to create order");
        setLoading(false);
        return;
      }

      setLoading(false);

      const options = {
        key: orderData.key_id, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RailConnect",
        description: `Booking ID: ${bookingId.substring(0,8).toUpperCase()}`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
           setLoading(true);
           try {
             const { confirmPayment } = await import("@/app/actions");
             const confirmRes = await confirmPayment(bookingId);
             if (confirmRes?.error) {
               toast.error(confirmRes.error);
             } else {
               // Fire off email and SMS and await them to prevent Next.js RSC payload conflicts
               const { sendTicketEmail, sendTicketSMS } = await import("@/app/actions/comms");
               await Promise.allSettled([
                 sendTicketEmail(bookingId),
                 sendTicketSMS(bookingId)
               ]);
               router.push(`/bookings/${res.pnr}`);
             }
           } catch(e) {
             toast.error("Error confirming ticket after payment.");
           }
           setLoading(false);
        },
        prefill: {
          name: passengers[0]?.name || "User",
          contact: emergencyContact || "9999999999"
        },
        theme: {
          color: "#0f172a" 
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment Failed! Reason: " + response.error.description);
      });

      rzp.open();

    } catch (error) {
      toast.error("Failed to book ticket. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-4 items-start">
      {/* Left Column: Form */}
      <div className="flex-1 space-y-6 w-full">
        {/* Class Selection */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Select Class</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {train.coaches.map((cls: any) => (
              <div 
                key={cls.id}
                onClick={() => setSeatClass(cls.id)}
                className={`rounded-2xl p-4 cursor-pointer transition-all text-center border-2 ${seatClass === cls.id ? "border-slate-900 bg-slate-50 shadow-md" : "border-slate-100 bg-white hover:border-slate-300"}`}
              >
                <h3 className="font-bold text-slate-900">{cls.name}</h3>
                <p className="text-slate-600 font-bold mt-1 text-sm">₹{cls.price}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">{cls.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Passenger Info */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Passenger Details</h2>
            <button onClick={addPassenger} className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-bold py-2 px-4 rounded-xl transition-colors">
              + Add Passenger
            </button>
          </div>
          
          <form id="booking-form" onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-6">
              {passengers.map((p, idx) => (
                <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">Passenger {idx + 1}</h3>
                    {passengers.length > 1 && (
                      <button type="button" onClick={() => removePassenger(idx)} className="text-red-500 hover:text-red-700 text-sm font-bold">Remove</button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input type="text" value={p.name} onChange={(e) => updatePassenger(idx, "name", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-medium text-slate-800 placeholder-slate-400" placeholder="Full Name" required />
                    <input type="number" value={p.age} onChange={(e) => updatePassenger(idx, "age", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-medium text-slate-800 placeholder-slate-400" placeholder="Age" min="1" max="120" required />
                    <select value={p.gender} onChange={(e) => updatePassenger(idx, "gender", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-medium text-slate-800">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Transgender">Transgender</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <select value={p.berthPreference} onChange={(e) => updatePassenger(idx, "berthPreference", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700">
                      <option value="No Preference">Berth: No Pref</option>
                      <option value="Lower">Lower</option>
                      <option value="Middle">Middle</option>
                      <option value="Upper">Upper</option>
                      <option value="Side Lower">Side Lower</option>
                      <option value="Side Upper">Side Upper</option>
                    </select>
                    <select value={p.mealPreference} onChange={(e) => updatePassenger(idx, "mealPreference", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700">
                      <option value="None">Meal: None</option>
                      <option value="Veg">Veg</option>
                      <option value="Non-Veg">Non-Veg</option>
                    </select>
                    <select value={p.idType} onChange={(e) => updatePassenger(idx, "idType", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700">
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN">PAN</option>
                      <option value="Passport">Passport</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                    <input type="text" value={p.idNumber} onChange={(e) => updatePassenger(idx, "idNumber", e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400" placeholder={p.idType === 'Aadhaar' ? "Aadhaar Number" : `${p.idType} Number`} required={true} />
                  </div>
                  
                  {/* Quotas & Concessions */}
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={p.isSeniorCitizen} onChange={(e) => updatePassenger(idx, "isSeniorCitizen", e.target.checked)} className="rounded text-slate-900 focus:ring-slate-900" />
                        Senior Citizen Quota
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={p.isStudent} onChange={(e) => updatePassenger(idx, "isStudent", e.target.checked)} className="rounded text-slate-900 focus:ring-slate-900" />
                        Student Concession
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={p.isDisabled} onChange={(e) => updatePassenger(idx, "isDisabled", e.target.checked)} className="rounded text-slate-900 focus:ring-slate-900" />
                        Disabled Quota
                      </label>
                      <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={p.isInfant} onChange={(e) => updatePassenger(idx, "isInfant", e.target.checked)} className="rounded text-slate-900 focus:ring-slate-900" />
                        Infant (No Berth)
                      </label>
                    </div>
                    {errors[idx] && (
                      <div className="text-red-500 text-sm font-bold mt-1">
                        {errors[idx]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Info */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Contact Details</h3>
              <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} className="w-full md:w-1/2 px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium text-slate-800 placeholder-slate-400" placeholder="Mobile Number (for SMS alerts)" required />
            </div>

          </form>
        </div>
      </div>

      {/* Right Column: Fare Widget */}
      <div className="w-full lg:w-[350px] shrink-0 sticky top-6">
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-emerald-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fare Summary
          </h2>

          <div className="space-y-4 mb-6 relative z-10">
            <div className="flex justify-between text-white/70 text-sm font-medium">
              <span>Base Fare ({passengers.length} x ₹{basePricePerSeat})</span>
              <span className="text-white">₹{baseFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/70 text-sm font-medium">
              <span>Reservation Charges</span>
              <span className="text-white">₹{reservationCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/70 text-sm font-medium">
              <span>GST (5%)</span>
              <span className="text-white">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/70 text-sm font-medium">
              <span>Convenience Fee</span>
              <span className="text-white">₹{convenienceFee.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-400 text-sm font-bold">
                <span>Concession/Discounts</span>
                <span>- ₹{discount.toFixed(2)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-yellow-400 text-sm font-bold">
                <span>🎟️ Coupon ({appliedCoupon?.code})</span>
                <span>- ₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          {/* Coupon Code Input */}
          <div className="mb-4 relative z-10 border-t border-white/10 pt-4">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">🏷️ Have a promo code?</p>
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                  placeholder="Promo code"
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/40 px-3 py-2.5 rounded-xl text-sm font-bold focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50 shrink-0"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-yellow-400/10 border border-yellow-400/30 px-3 py-2.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-lg">🎟️</span>
                  <div>
                    <p className="text-yellow-400 font-black text-sm">{appliedCoupon.code}</p>
                    <p className="text-white/50 text-[10px] font-bold">{appliedCoupon.discountPercentage}% off · max ₹{appliedCoupon.maxDiscount}</p>
                  </div>
                </div>
                <button type="button" onClick={handleRemoveCoupon} className="text-white/40 hover:text-white text-xs font-bold transition-colors">✕ Remove</button>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 mb-6 relative z-10">
            <div className="flex justify-between items-end">
              <span className="text-white/70 font-medium">Total Amount</span>
              <span className="text-3xl font-black text-white">₹{totalFare.toFixed(0)}</span>
            </div>
          </div>

          <button 
            form="booking-form"
            disabled={loading} 
            type="submit" 
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-4 px-6 rounded-full transition-colors disabled:opacity-50 text-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] relative z-10"
          >
            {loading ? "Processing..." : "Pay & Book Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
