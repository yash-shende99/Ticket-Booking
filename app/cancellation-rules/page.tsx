export default function CancellationRulesPage() {
  return (
    <div className="bg-transparent">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-8">Cancellation Rules & Refund Policy</h1>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Confirmed Tickets</h2>
            <ul className="list-disc pl-5 space-y-3 text-slate-600 font-medium leading-relaxed">
              <li>If a confirmed ticket is cancelled more than 48 hours before the scheduled departure of the train, a flat cancellation charge of ₹240 for 1st AC, ₹200 for 2nd AC, and ₹180 for 3rd AC will be deducted.</li>
              <li>If cancelled between 48 hours and 12 hours before departure, 25% of the fare subject to the minimum cancellation charge will be deducted.</li>
              <li>If cancelled between 12 hours and 4 hours before departure, 50% of the fare subject to the minimum cancellation charge will be deducted.</li>
              <li>No refund will be granted on confirmed tickets cancelled less than 4 hours before the scheduled departure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. RAC and Waitlisted Tickets</h2>
            <ul className="list-disc pl-5 space-y-3 text-slate-600 font-medium leading-relaxed">
              <li>For RAC and Waitlisted tickets cancelled up to 30 minutes before the scheduled departure of the train, full refund will be granted after deducting a clerkage charge of ₹60 per passenger.</li>
              <li>If a Waitlisted ticket is not confirmed at the time of chart preparation, the ticket will automatically be cancelled and a full refund will be processed directly to the source account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. E-Tickets Refund Process</h2>
            <ul className="list-disc pl-5 space-y-3 text-slate-600 font-medium leading-relaxed">
              <li>E-tickets cannot be cancelled at physical railway reservation counters. They must be cancelled online through your RailConnect account.</li>
              <li>Upon successful cancellation, the refund amount will be credited back to the original mode of payment (bank account, credit card, or wallet) within 3-5 working days.</li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
}
