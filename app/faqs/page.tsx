export default function FAQsPage() {
  const faqs = [
    {
      question: "How do I book a ticket?",
      answer: "You can book a ticket by searching for trains between your source and destination stations on the home page, selecting a train and class, and proceeding to payment."
    },
    {
      question: "Can I cancel my confirmed ticket?",
      answer: "Yes, confirmed tickets can be cancelled before the chart is prepared. Cancellation charges will apply based on the time of cancellation."
    },
    {
      question: "How do I check my PNR status?",
      answer: "You can check your PNR status from the 'Live Status' tab on the home page or directly from the 'My Tickets' dashboard."
    },
    {
      question: "What is the difference between Waitlist and RAC?",
      answer: "RAC (Reservation Against Cancellation) allows you to board the train and share a berth. Waitlist means you cannot board the train unless your ticket gets confirmed."
    },
    {
      question: "Are senior citizen concessions available?",
      answer: "Yes, female senior citizens (58+ years) get a 40% discount, and male senior citizens (60+ years) get a 40% discount on base fares."
    }
  ];

  return (
    <div className="bg-transparent">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-8">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
              <p className="text-slate-600 font-medium leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
