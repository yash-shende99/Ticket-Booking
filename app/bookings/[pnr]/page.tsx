import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import { Route } from "@/models/Route";
import { Station } from "@/models/Station";
import { notFound } from "next/navigation";
import TicketClient from "./TicketClient";

export default async function TicketPage({ params }: { params: Promise<{ pnr: string }> }) {
  const { pnr } = await params;
  await dbConnect();
  
  // Ensure Route and Station models are loaded
  Route.schema;
  Station.schema;
  
  const booking = await Booking.findOne({ pnr: pnr.toUpperCase() })
    .populate({
      path: "trainId",
      populate: {
        path: "route",
        populate: {
          path: "stations.station",
          model: "Station"
        }
      }
    })
    .lean();

  if (!booking) {
    notFound();
  }

  // Safely serialize for Client Component
  const safeBooking = JSON.parse(JSON.stringify(booking));

  return (
    <div className="max-w-4xl mx-auto py-8">
      <TicketClient booking={safeBooking} />
    </div>
  );
}
