import dbConnect from "./db";
import { SeatInventory } from "@/models/SeatInventory";

export async function getSeatInventory(
  trainId: string, 
  routeId: string, 
  journeyDate: Date, 
  coachClass: string, 
  totalCapacity: number,
  baseFare: number
) {
  await dbConnect();
  
  // Normalize date to start of day for indexing
  const normalizedDate = new Date(journeyDate);
  normalizedDate.setHours(0, 0, 0, 0);

  let inventory = await SeatInventory.findOne({
    train: trainId,
    journeyDate: normalizedDate,
    coachClass
  }).lean();

  if (!inventory) {
    // Dynamically create inventory if it doesn't exist
    // 5% of seats are RAC, 10% are WL
    const racSeats = Math.ceil(totalCapacity * 0.05);
    const wlSeats = Math.ceil(totalCapacity * 0.10);
    
    try {
      const newInventory = await SeatInventory.create({
        train: trainId,
        route: routeId,
        journeyDate: normalizedDate,
        coachClass,
        totalSeats: totalCapacity,
        availableSeats: totalCapacity,
        racSeats,
        wlSeats,
        racCount: 0,
        wlCount: 0,
        baseFare
      });
      inventory = newInventory.toObject();
    } catch (e: any) {
      // Handle race condition (if another request just created it)
      if (e.code === 11000) {
        inventory = await SeatInventory.findOne({
          train: trainId,
          journeyDate: normalizedDate,
          coachClass
        }).lean();
      } else {
        throw e;
      }
    }
  }

  // Calculate status
  let status = "AVAILABLE";
  let count = inventory.availableSeats;
  let color = "text-green-600 bg-green-50 border-green-200";

  if (inventory.availableSeats === 0) {
    if (inventory.racCount < inventory.racSeats) {
      status = "RAC";
      count = inventory.racCount + 1;
      color = "text-orange-600 bg-orange-50 border-orange-200";
    } else if (inventory.wlCount < inventory.wlSeats) {
      status = "WL";
      count = inventory.wlCount + 1;
      color = "text-red-600 bg-red-50 border-red-200";
    } else {
      status = "REGRET";
      count = 0;
      color = "text-gray-600 bg-gray-50 border-gray-200";
    }
  }

  return { ...inventory, status, count, color };
}
