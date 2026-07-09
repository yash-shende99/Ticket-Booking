"use server";

import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import { revalidatePath } from "next/cache";

export async function createBooking(formData: FormData) {
  await dbConnect();
  
  const trainId = formData.get("trainId") as string;
  const passengerName = formData.get("passengerName") as string;
  const passengerAge = parseInt(formData.get("passengerAge") as string, 10);
  const seatClass = formData.get("seatClass") as string;
  
  const train = await Train.findById(trainId);
  if (!train) {
    throw new Error("Train not found");
  }

  let pricePaid = 0;
  if (seatClass === "1AC") pricePaid = train.price1AC;
  else if (seatClass === "2AC") pricePaid = train.price2AC;
  else if (seatClass === "Sleeper") pricePaid = train.priceSleeper;
  else pricePaid = train.priceGeneral;

  const pnr = Math.random().toString(36).substring(2, 10).toUpperCase();

  const newBooking = await Booking.create({
    pnr,
    passengerName,
    passengerAge,
    trainId,
    seatClass,
    pricePaid,
  });

  revalidatePath("/bookings");
  return newBooking._id.toString();
}
