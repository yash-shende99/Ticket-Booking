"use client";

import { useState } from "react";
import Link from "next/navigation";

export default function TicketClient({ booking }: { booking: any }) {
  const train = booking.trainId;
  const source = train.route?.stations?.[0]?.station?.name || "Source";
  const dest = train.route?.stations?.[train.route.stations.length - 1]?.station?.name || "Destination";
  
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const simulateEmail = () => {
    setEmailSent(true);
    setTimeout(() => alert("E-Ticket has been sent to your registered Email address!"), 500);
  };

  const simulateSMS = () => {
    setSmsSent(true);
    setTimeout(() => alert(`SMS containing Ticket link sent to ${booking.emergencyContact || "your registered mobile number"}.`), 500);
  };

  return (
    <div className="space-y-6">
      
      {/* Actions Bar - Hidden during print */}
      <div className="flex gap-4 justify-end mb-8 print:hidden">
        <button onClick={simulateSMS} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          {smsSent ? "✓ SMS Sent" : "Send SMS"}
        </button>
        <button onClick={simulateEmail} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
          {emailSent ? "✓ Email Sent" : "Email Ticket"}
        </button>
        <button onClick={handlePrint} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl text-sm font-black transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* The Printable Ticket Area */}
      <div id="printable-ticket" className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:border-4 print:border-black">
        
        {/* Ticket Header */}
        <div className="bg-slate-900 text-white p-8 flex justify-between items-center print:bg-slate-900 print:text-white">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              E-Ticket (Electronic Reservation Slip)
            </h1>
            <p className="text-slate-400 mt-2 font-bold tracking-widest text-sm uppercase">RailConnect Ticketing Service</p>
          </div>
          <div className="text-right bg-white p-3 rounded-2xl">
            {/* Simulated QR Code using Google Charts API for absolute simplicity and zero dependencies */}
            <img src={`https://chart.googleapis.com/chart?cht=qr&chs=100x100&chl=PNR:${booking.pnr}|TRAIN:${train.trainNumber}`} alt="Ticket QR Code" className="w-24 h-24 print:w-32 print:h-32" />
          </div>
        </div>

        {/* PNR & Train Info Strip */}
        <div className="bg-slate-100 p-6 flex justify-between items-center border-b-2 border-slate-200 print:bg-slate-100 print:border-black">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">PNR Number</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{booking.pnr}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Train Details</p>
            <p className="text-xl font-black text-slate-900">{train.trainNumber} - {train.name}</p>
            <p className="text-sm font-bold text-slate-600 mt-1">Class: {booking.seatClass}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Journey Date</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{new Date(booking.journeyDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Journey Details */}
        <div className="p-8 flex justify-between items-center border-b-2 border-slate-200 print:border-black">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Boarding From</p>
            <p className="text-2xl font-black text-slate-900">{source}</p>
            <p className="text-slate-500 font-bold mt-1">Departs: {train.departureTime || "--:--"}</p>
          </div>
          <div className="flex-1 px-8 relative">
            <div className="w-full border-t-4 border-dashed border-slate-300 print:border-black"></div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Destination</p>
            <p className="text-2xl font-black text-slate-900">{dest}</p>
          </div>
        </div>

        {/* Passenger List */}
        <div className="p-8 border-b-2 border-slate-200 print:border-black">
          <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest">Passenger Details</h3>
          <div className="overflow-hidden rounded-2xl border-2 border-slate-200 print:border-black">
            <table className="w-full text-left">
              <thead className="bg-slate-100 print:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Age/Gender</th>
                  <th className="p-4">Coach</th>
                  <th className="p-4">Seat / Berth</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100 print:divide-black font-medium text-slate-900">
                {booking.passengers.map((p: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-4 font-bold">{p.name}</td>
                    <td className="p-4 text-slate-600">{p.age} / {p.gender.charAt(0)}</td>
                    <td className="p-4 font-black">{p.allocatedCoach}</td>
                    <td className="p-4 font-black">
                      {p.allocatedSeat > 0 ? `${p.allocatedSeat} (${p.allocatedBerthType})` : p.allocatedBerthType}
                    </td>
                    <td className="p-4 text-emerald-600 font-black tracking-widest">CNF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fare & Invoice */}
        <div className="p-8 bg-slate-50 print:bg-transparent flex justify-between items-start">
          <div className="max-w-xs">
            <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-widest">Important Instructions</h3>
            <ul className="text-xs text-slate-500 space-y-1 font-medium list-disc ml-4">
              <li>Please carry original ID proof during journey.</li>
              <li>Reach the station at least 30 minutes before departure.</li>
              <li>This ticket is non-transferable.</li>
            </ul>
          </div>
          
          <div className="w-64">
            <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest border-b-2 border-slate-200 pb-2 print:border-black">Fare Breakdown</h3>
            <div className="space-y-2 text-sm font-medium text-slate-600">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span className="text-slate-900">₹{booking.fareDetails.baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Reservation Charge</span>
                <span className="text-slate-900">₹{booking.fareDetails.reservationCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="text-slate-900">₹{booking.fareDetails.gst.toFixed(2)}</span>
              </div>
              {booking.fareDetails.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discounts</span>
                  <span>- ₹{booking.fareDetails.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center font-black text-slate-900 text-lg border-t-2 border-slate-200 print:border-black pt-2 mt-2">
                <span>Total Fare</span>
                <span>₹{booking.pricePaid.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
