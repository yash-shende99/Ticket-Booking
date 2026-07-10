import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import BookingsClient from "./BookingsClient";

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ pnr?: string }> }) {
  await dbConnect();
  
  const { pnr } = await searchParams;
  const query = pnr ? { pnr: pnr.toUpperCase() } : {};
  
  const bookings = await Booking.find(query)
    .populate({
      path: "trainId",
      populate: {
        path: "route",
        populate: [
          { path: "source", model: "Station" },
          { path: "destination", model: "Station" }
        ]
      }
    })
    .sort({ createdAt: -1 })
    .lean();

  const serializedBookings = JSON.parse(JSON.stringify(bookings));

  return <BookingsClient initialBookings={serializedBookings} />;
}
