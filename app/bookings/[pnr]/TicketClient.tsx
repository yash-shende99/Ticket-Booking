"use client";

import { useState, useEffect } from "react";
import Link from "next/navigation";
import { createPortal } from "react-dom";
import QRCode from "react-qr-code";

export default function TicketClient({ booking }: { booking: any }) {
  const train = booking.trainId;
  const source = train.route?.stations?.[0]?.station?.name || "Source";
  const dest = train.route?.stations?.[train.route.stations.length - 1]?.station?.name || "Destination";
  
  const [emailSent, setEmailSent] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [modalState, setModalState] = useState<{ isOpen: boolean, type: 'confirm' | 'alert' | 'success', title: string, message: string, onConfirm?: () => void }>({
    isOpen: false, type: 'alert', title: '', message: ''
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false }));

  const handlePrint = () => {
    window.print();
  };

  const [emailLoading, setEmailLoading] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);

  const simulateEmail = async () => {
    setEmailLoading(true);
    const { sendTicketEmail } = await import("@/app/actions/comms");
    const res = await sendTicketEmail(booking._id.toString());
    setEmailLoading(false);
    
    if (res.error) {
      setModalState({ isOpen: true, type: 'alert', title: 'Email Failed', message: res.error });
    } else {
      setEmailSent(true);
      setModalState({ isOpen: true, type: 'success', title: 'Email Sent', message: 'E-Ticket has been successfully sent to your registered Email address!' });
    }
  };

  const simulateSMS = async () => {
    setSmsLoading(true);
    const { sendTicketSMS } = await import("@/app/actions/comms");
    const res = await sendTicketSMS(booking._id.toString());
    setSmsLoading(false);
    
    if (res.error) {
      setModalState({ isOpen: true, type: 'alert', title: 'SMS Failed', message: res.error });
    } else {
      setSmsSent(true);
      setModalState({ isOpen: true, type: 'success', title: 'SMS Sent', message: `SMS containing Ticket link sent to ${booking.emergencyContact || "your registered mobile number"}.` });
    }
  };

  const handleCancelClick = () => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Cancel Ticket',
      message: 'Are you sure you want to cancel this ticket? Cancellation charges will apply based on departure time.',
      onConfirm: async () => {
        closeModal();
        const { cancelBooking } = await import("@/app/actions");
        const res = await cancelBooking(booking._id.toString());
        if (res.error) {
          setModalState({ isOpen: true, type: 'alert', title: 'Error', message: res.error });
        } else {
          setModalState({ isOpen: true, type: 'success', title: 'Ticket Cancelled', message: `Ticket cancelled successfully.\n\nRefund Amount: ₹${res.refundAmount}\nCancellation Fee: ₹${res.cancellationFee}` });
        }
      }
    });
  };

  const ModalContent = () => (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className={`p-6 ${modalState.type === 'confirm' ? 'bg-red-50' : modalState.type === 'success' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
          <h3 className={`text-xl font-black ${modalState.type === 'confirm' ? 'text-red-600' : modalState.type === 'success' ? 'text-emerald-600' : 'text-amber-600'}`}>
            {modalState.title}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-slate-600 font-medium whitespace-pre-wrap">{modalState.message}</p>
          <div className="mt-8 flex gap-3 justify-end">
            {modalState.type === 'confirm' && (
              <button onClick={closeModal} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                Keep Ticket
              </button>
            )}
            <button 
              onClick={() => {
                if (modalState.type === 'confirm' && modalState.onConfirm) {
                  modalState.onConfirm();
                } else {
                  closeModal();
                }
              }} 
              className={`px-6 py-2 text-white font-bold rounded-xl transition-colors shadow-lg ${modalState.type === 'confirm' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-slate-900 hover:bg-black shadow-slate-900/20'}`}
            >
              {modalState.type === 'confirm' ? 'Yes, Cancel it' : 'Okay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Custom Modal Overlay in Portal */}
      {modalState.isOpen && mounted && typeof document !== 'undefined' && createPortal(<ModalContent />, document.body)}

      {/* Actions Bar - Hidden during print */}
      <div className="flex gap-4 justify-end mb-8 print:hidden">
        {booking.status !== "CANCELLED" && (
          <button onClick={handleCancelClick} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            Cancel Ticket
          </button>
        )}
        <button disabled={smsLoading} onClick={simulateSMS} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
          {smsLoading ? "Sending..." : smsSent ? "✓ SMS Sent" : "Send SMS"}
        </button>
        <button disabled={emailLoading} onClick={simulateEmail} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
          {emailLoading ? "Sending..." : emailSent ? "✓ Email Sent" : "Email Ticket"}
        </button>
        <button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Tax Invoice
        </button>
        <button onClick={handlePrint} className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl text-sm font-black transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* The Printable Ticket Area */}
      <div id="printable-ticket" className={`bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-2xl print:shadow-none print:border-4 print:border-black relative ${booking.status === 'CANCELLED' ? 'opacity-75 grayscale sepia-0' : ''}`}>
        
        {booking.status === "CANCELLED" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <h1 className="text-8xl font-black text-red-500/20 rotate-[-30deg] tracking-widest border-8 border-red-500/20 p-8 rounded-3xl uppercase">Cancelled</h1>
          </div>
        )}

        {/* Ticket Header */}
        <div className={`${booking.status === 'CANCELLED' ? 'bg-red-900' : 'bg-slate-900'} text-white p-8 flex justify-between items-center print:bg-slate-900 print:text-white transition-colors`}>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              E-Ticket (Electronic Reservation Slip)
            </h1>
            <p className="text-slate-400 mt-2 font-bold tracking-widest text-sm uppercase">RailConnect Ticketing Service</p>
          </div>
          <div className="text-right bg-white p-3 rounded-2xl flex items-center justify-center">
            <QRCode value={`https://railconnect.app/bookings/${booking.pnr}`} size={128} />
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
                {booking.passengers.map((p: any, idx: number) => {
                  let statusColor = "text-emerald-600";
                  let displayStatus = "CNF";
                  
                  if (p.currentStatus === "CANCELLED") {
                    statusColor = "text-red-600";
                    displayStatus = "CANCELLED";
                  } else if (p.currentStatus === "WL") {
                    statusColor = "text-orange-500";
                    displayStatus = `WL / ${p.queuePosition}`;
                  } else if (p.currentStatus === "RAC") {
                    statusColor = "text-amber-500";
                    displayStatus = `RAC / ${p.queuePosition}`;
                  }

                  return (
                    <tr key={idx} className={p.currentStatus === 'CANCELLED' ? 'opacity-50 line-through' : ''}>
                      <td className="p-4 font-bold">{p.name}</td>
                      <td className="p-4 text-slate-600">{p.age} / {p.gender.charAt(0)}</td>
                      <td className="p-4 font-black">{p.allocatedCoach}</td>
                      <td className="p-4 font-black">
                        {p.allocatedSeat > 0 ? `${p.allocatedSeat} (${p.allocatedBerthType})` : p.allocatedBerthType}
                      </td>
                      <td className={`p-4 font-black tracking-widest ${statusColor}`}>{displayStatus}</td>
                    </tr>
                  );
                })}
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
