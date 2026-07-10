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
    
    // Capacity Engine using Database Quotas
    const inventory = await SeatInventory.findOne({
      train: train._id,
      journeyDate,
      coachClass: seatClass
    });

    // Use actual DB config if available, otherwise strict 5-5 for demo safety
    const MAX_CNF = inventory ? inventory.totalSeats : 5;
    const MAX_RAC = inventory ? inventory.racSeats : 5;

    const existingBookings = await Booking.find({
      trainId,
      seatClass,
      journeyDate,
      status: { $ne: 'CANCELLED' }
    });
    
    let existingSeatsBooked = 0;
    existingBookings.forEach(b => {
      existingSeatsBooked += b.passengers.filter((p:any) => !(p.isInfant && p.age < 5)).length;
    });

    passengers = passengers.map((p: any) => {
      if (p.isInfant && Number(p.age) < 5) {
        return { 
          ...p, 
          allocatedCoach: "N/A", 
          allocatedSeat: 0, 
          allocatedBerthType: "No Berth",
          bookingStatus: "CNF",
          currentStatus: "CNF",
          queuePosition: 0
        };
      }
      
      existingSeatsBooked++; // Book seat by seat
      
      let pStatus = "CNF";
      let pQueue = 0;
      
      if (existingSeatsBooked <= MAX_CNF) {
        pStatus = "CNF";
      } else if (existingSeatsBooked <= MAX_CNF + MAX_RAC) {
        pStatus = "RAC";
        pQueue = existingSeatsBooked - MAX_CNF;
      } else {
        pStatus = "WL";
        pQueue = existingSeatsBooked - (MAX_CNF + MAX_RAC);
      }
      
      let allocatedCoach = "N/A";
      let allocatedSeat = 0;
      let allocatedBerthType = "No Berth";
      
      if (pStatus === "CNF") {
        let coachPrefix = "S";
        if (seatClass === "1A") coachPrefix = "H";
        else if (seatClass === "2A") coachPrefix = "A";
        else if (seatClass === "3A") coachPrefix = "B";
        else if (seatClass === "CC") coachPrefix = "C";
        
        allocatedCoach = `${coachPrefix}1`;
        allocatedSeat = existingSeatsBooked; // Sequential filling
        
        allocatedBerthType = getBerthType(allocatedSeat);
        if ((p.isSeniorCitizen || p.isDisabled) && p.berthPreference === "Lower") {
          allocatedBerthType = "Lower"; // Engine override
        }
      } else if (pStatus === "RAC") {
        allocatedCoach = "RAC";
        allocatedSeat = pQueue;
        allocatedBerthType = "Side Lower (Shared)";
      }
      
      return {
        ...p,
        allocatedCoach,
        allocatedSeat,
        allocatedBerthType,
        bookingStatus: pStatus,
        currentStatus: pStatus,
        queuePosition: pQueue
      };
    });

    let overallStatus = "CONFIRMED";
    if (passengers.some((p:any) => p.currentStatus === "WL")) overallStatus = "WL";
    else if (passengers.some((p:any) => p.currentStatus === "RAC")) overallStatus = "RAC";

    const pnr = Math.random().toString(36).substring(2, 12).toUpperCase();

    const newBooking = await Booking.create({
      pnr,
      passengers,
      trainId,
      seatClass,
      fareDetails,
      pricePaid,
      journeyDate,
      status: overallStatus,
      paymentStatus: "PENDING",
      emergencyContact
    });

    // Update Seat Inventory so the Search UI reflects capacity correctly
    if (inventory) {
      let cnfBooked = 0;
      let racBooked = 0;
      let wlBooked = 0;
      passengers.forEach((p: any) => {
        if (p.isInfant && Number(p.age) < 5) return;
        if (p.currentStatus === "CNF") cnfBooked++;
        else if (p.currentStatus === "RAC") racBooked++;
        else if (p.currentStatus === "WL") wlBooked++;
      });

      inventory.availableSeats = Math.max(0, inventory.availableSeats - cnfBooked);
      inventory.racCount += racBooked;
      inventory.wlCount += wlBooked;
      await inventory.save();
    }

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

export async function cancelBooking(bookingId: string) {
  try {
    await dbConnect();
    const booking = await Booking.findById(bookingId).populate("trainId");
    if (!booking) return { error: "Booking not found" };
    if (booking.paymentStatus === "REFUNDED" || booking.status === "CANCELLED") {
      return { error: "Booking already cancelled" };
    }

    const journeyDateTime = new Date(booking.journeyDate);
    if (booking.trainId && booking.trainId.departureTime) {
      const [hours, mins] = booking.trainId.departureTime.split(':').map(Number);
      journeyDateTime.setHours(hours, mins, 0, 0);
    }
    
    const hoursToDeparture = (journeyDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    const numPassengers = booking.passengers.filter((p: any) => !(p.isInfant && Number(p.age) < 5)).length;
    
    let cancellationFee = 0;

    if (booking.status === "RAC" || booking.status === "WL") {
      if (hoursToDeparture >= 0.5) {
        cancellationFee = 60 * numPassengers;
      } else {
        cancellationFee = booking.pricePaid; // No refund
      }
    } else {
      let flatCharge = 60;
      if (booking.seatClass === "1A") flatCharge = 240;
      else if (booking.seatClass === "2A") flatCharge = 200;
      else if (booking.seatClass === "3A" || booking.seatClass === "CC") flatCharge = 180;
      else if (booking.seatClass === "SL") flatCharge = 120;
      
      const minFlatFee = flatCharge * numPassengers;

      if (hoursToDeparture > 72) {
        cancellationFee = minFlatFee;
      } else if (hoursToDeparture > 24) {
        cancellationFee = Math.max(minFlatFee, booking.pricePaid * 0.25);
      } else if (hoursToDeparture > 8) {
        cancellationFee = Math.max(minFlatFee, booking.pricePaid * 0.50);
      } else {
        cancellationFee = booking.pricePaid;
      }
    }

    const refundAmount = Math.max(0, booking.pricePaid - cancellationFee);

    // Auto-Confirmation Engine (Cascade Upgrades: WL -> RAC -> CNF)
    let cnfFreed = 0;
    let racFreed = 0;

    booking.passengers.forEach((p: any) => {
      if (!(p.isInfant && Number(p.age) < 5)) {
        if (p.currentStatus === "CNF") cnfFreed++;
        else if (p.currentStatus === "RAC") racFreed++;
      }
      p.currentStatus = "CANCELLED";
    });

    if (cnfFreed > 0 || racFreed > 0) {
      // Find all ACTIVE bookings for this train/date/class, ordered by ObjectId (which implies chronological order)
      const activeBookings = await Booking.find({
        trainId: booking.trainId._id,
        seatClass: booking.seatClass,
        journeyDate: booking.journeyDate,
        status: { $ne: "CANCELLED" },
        _id: { $ne: booking._id }
      }).sort({ _id: 1 });

      for (const b of activeBookings) {
        let changed = false;
        
        // Phase 1: Promote RAC to CNF
        b.passengers.forEach((p: any) => {
          if (p.currentStatus === "RAC" && cnfFreed > 0) {
            p.currentStatus = "CNF";
            p.queuePosition = 0;
            p.allocatedCoach = "S1"; // Mock reallocation
            p.allocatedBerthType = "Lower (Upgraded)"; 
            cnfFreed--;
            racFreed++; // Upgrading an RAC frees up an RAC spot!
            changed = true;
          }
        });
        
        // Phase 2: Promote WL to RAC
        b.passengers.forEach((p: any) => {
          if (p.currentStatus === "WL" && racFreed > 0) {
            p.currentStatus = "RAC";
            p.queuePosition = 0;
            p.allocatedCoach = "RAC";
            p.allocatedBerthType = "Side Lower (Shared)";
            racFreed--;
            changed = true;
          }
        });

        if (changed) {
          // Re-evaluate overall booking status
          let newOverall = "CONFIRMED";
          if (b.passengers.some((p:any) => p.currentStatus === "WL")) newOverall = "WL";
          else if (b.passengers.some((p:any) => p.currentStatus === "RAC")) newOverall = "RAC";
          b.status = newOverall;
          
          await b.save();
          
          // Send automatic notification of ticket upgrade!
          import("@/app/actions/comms").then(({ sendTicketSMS, sendTicketEmail }) => {
            sendTicketSMS(b._id.toString()).catch(() => {});
            sendTicketEmail(b._id.toString()).catch(() => {});
          });
        }
      }
    }

    booking.status = "CANCELLED";
    booking.paymentStatus = "REFUNDED";
    booking.fareDetails = {
      ...booking.fareDetails,
      cancellationFee,
      refundAmount
    };

    await booking.save();
    revalidatePath(`/bookings/${booking.pnr}`);
    revalidatePath("/profile/payments");
    
    return { success: true, refundAmount, cancellationFee };
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return { error: "Failed to cancel booking" };
  }
}
