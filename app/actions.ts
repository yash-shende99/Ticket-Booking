"use server";

import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import { Train } from "@/models/Train";
import { SeatInventory } from "@/models/SeatInventory";
import { revalidatePath } from "next/cache";

// Helper to determine Berth Type based on seat number (1-72 layout)
function getBerthType(seatNumber: number): string {
  const mod = seatNumber % 8;
  if (mod === 1 || mod === 4) return "Lower";
  if (mod === 2 || mod === 5) return "Middle";
  if (mod === 3 || mod === 6) return "Upper";
  if (mod === 7) return "Side Lower";
  if (mod === 0) return "Side Upper";
  return "Lower";
}

export async function createBooking(formData: FormData) {
  try {
    await dbConnect();
    
    const trainId = formData.get("trainId") as string;
    const seatClass = formData.get("seatClass") as string;
    const pricePaid = parseInt(formData.get("pricePaid") as string, 10);
    const journeyDateStr = formData.get("journeyDate") as string;
    const emergencyContact = formData.get("emergencyContact") as string;
    
    const passengersStr = formData.get("passengers") as string;
    const fareDetailsStr = formData.get("fareDetails") as string;
    
    if (!passengersStr || !fareDetailsStr) {
      return { error: "Invalid booking data: missing passengers or fare details" };
    }

    let passengers = JSON.parse(passengersStr);
    const fareDetails = JSON.parse(fareDetailsStr);
    
    const train = await Train.findById(trainId);
    if (!train) {
      return { error: "Train not found" };
    }

    const journeyDate = journeyDateStr ? new Date(journeyDateStr) : new Date();
    journeyDate.setHours(0, 0, 0, 0);
    
    const inventory = await SeatInventory.findOne({
      train: train._id,
      journeyDate,
      coachClass: seatClass
    });

    let bookingStatus = "CONFIRMED";
    const numPassengersToBook = passengers.filter((p:any) => !(p.isInfant && Number(p.age) < 5)).length;

    if (inventory) {
      if (inventory.availableSeats >= numPassengersToBook) {
        inventory.availableSeats -= numPassengersToBook;
        bookingStatus = "CONFIRMED";
      } else if (inventory.racCount + numPassengersToBook <= inventory.racSeats) {
        inventory.racCount += numPassengersToBook;
        bookingStatus = "RAC";
      } else if (inventory.wlCount + numPassengersToBook <= inventory.wlSeats) {
        inventory.wlCount += numPassengersToBook;
        bookingStatus = "WL";
      } else {
        return { error: "Not enough seats available. Train is fully booked." };
      }
      await inventory.save();
    }

    // Seat Allocation Engine (Allocate Berths)
    if (bookingStatus === "CONFIRMED") {
      // Generate coach prefix based on class
      let coachPrefix = "S";
      if (seatClass === "1A") coachPrefix = "H";
      else if (seatClass === "2A") coachPrefix = "A";
      else if (seatClass === "3A") coachPrefix = "B";
      else if (seatClass === "CC") coachPrefix = "C";
      
      // Simulate finding a contiguous block of seats for the family
      const coachNumber = Math.floor(Math.random() * 4) + 1; // e.g., B1, B2, B3, B4
      const allocatedCoach = `${coachPrefix}${coachNumber}`;
      let startingSeat = Math.floor(Math.random() * 60) + 1;

      passengers = passengers.map((p: any) => {
        if (p.isInfant && Number(p.age) < 5) {
          return { ...p, allocatedCoach: "N/A", allocatedSeat: 0, allocatedBerthType: "No Berth" };
        }
        
        const seatNum = startingSeat++;
        
        // Override logic for specific quotas (just simulated for UI display)
        let finalBerth = getBerthType(seatNum);
        if ((p.isSeniorCitizen || p.isDisabled) && p.berthPreference === "Lower") {
          finalBerth = "Lower"; // Engine prioritizes lower for seniors
        } else if (p.berthPreference !== "No Preference") {
          // Engine attempts to match preference
          if (Math.random() > 0.3) finalBerth = p.berthPreference;
        }

        return {
          ...p,
          allocatedCoach,
          allocatedSeat: seatNum,
          allocatedBerthType: finalBerth
        };
      });
    } else {
      // WL or RAC allocation
      passengers = passengers.map((p: any) => {
         if (p.isInfant && Number(p.age) < 5) return { ...p, allocatedCoach: "N/A", allocatedSeat: 0, allocatedBerthType: "No Berth" };
         return {
           ...p,
           allocatedCoach: bookingStatus,
           allocatedSeat: 0,
           allocatedBerthType: bookingStatus
         };
      });
    }

    const pnr = Math.random().toString(36).substring(2, 12).toUpperCase();

    const newBooking = await Booking.create({
      pnr,
      passengers,
      trainId,
      seatClass,
      fareDetails,
      pricePaid,
      journeyDate,
      status: bookingStatus,
      paymentStatus: "PENDING",
      emergencyContact
    });

    revalidatePath("/bookings");
    return { success: true, pnr, bookingId: newBooking._id.toString() };
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return { error: error.message || "Internal server error during booking creation" };
  }
}

export async function confirmPayment(bookingId: string) {
  await dbConnect();
  const booking = await Booking.findById(bookingId);
  if (!booking) return { error: "Booking not found" };
  
  booking.paymentStatus = "PAID";
  await booking.save();
  
  revalidatePath("/bookings");
  return { success: true };
}
