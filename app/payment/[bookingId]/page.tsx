import PaymentGatewayClient from "./PaymentGatewayClient";
import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import { redirect } from "next/navigation";

export default async function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  await dbConnect();
  const booking = await Booking.findById(bookingId).populate("trainId").lean();

  if (!booking) {
    redirect("/");
  }

  // Ensure it's safely serialized for the client (stripping all deep ObjectId instances)
  const safeBooking = JSON.parse(JSON.stringify(booking));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4">
      <PaymentGatewayClient booking={safeBooking} />
    </div>
  );
}
