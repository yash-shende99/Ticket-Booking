import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Train } from "../models/Train";
import { Route } from "../models/Route";
import { Booking } from "../models/Booking";
import { SeatInventory } from "../models/SeatInventory";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env");
  process.exit(1);
}

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    console.log("Clearing outdated Seat Inventory and Bookings...");
    // Only delete dynamic data, keep Users, Stations, Routes, and Trains completely safe!
    await Booking.deleteMany({});
    await SeatInventory.deleteMany({});

    // Fetch master data needed to generate new inventory
    const trains = await Train.find({});
    const users = await User.find({ role: 'user' });
    const routes = await Route.find({});

    if (trains.length === 0 || users.length === 0) {
      console.error("Master data (Trains/Users) missing! Please run seedRealisticData.ts first.");
      process.exit(1);
    }

    console.log("Creating fresh Seat Inventory for the next 12 days...");
    const inventoryData = [];
    
    // Generate data from TODAY to TODAY + 12 DAYS
    for (let dayOffset = 0; dayOffset <= 12; dayOffset++) {
      const journeyDate = new Date();
      journeyDate.setDate(journeyDate.getDate() + dayOffset);
      journeyDate.setHours(0, 0, 0, 0);

      for (const train of trains) {
        // Skip days when train doesn't run
        if (!train.runningDays.includes(journeyDate.getDay())) continue;

        for (const coach of train.coaches) {
          // Generate realistic randomized booking patterns
          const bookedFactor = Math.random(); // 0 to 1
          const totalSeats = coach.capacity;
          
          let availableSeats = 0;
          let wlCount = 0;
          let racCount = 0;
          
          if (bookedFactor > 0.8) {
             // Overbooked! Waitlist Scenario
             availableSeats = 0;
             racCount = Math.floor(Math.random() * 20);
             wlCount = Math.floor(Math.random() * 100);
          } else {
             availableSeats = Math.floor(totalSeats * (1 - bookedFactor));
          }

          inventoryData.push({
            train: train._id, 
            route: train.route, 
            journeyDate, 
            coachClass: coach.coachClass,
            totalSeats, 
            availableSeats, 
            racSeats: 20, 
            wlSeats: 150, 
            racCount, 
            wlCount, 
            baseFare: Math.floor(train.basePricePerKm * 1000 * (coach.coachClass === '1A' ? 3 : coach.coachClass === '2A' ? 2 : coach.coachClass === '3A' ? 1.5 : 1))
          });
        }
      }
    }
    
    await SeatInventory.insertMany(inventoryData);

    console.log("Generating fresh realistic Bookings for the upcoming days...");
    const bookingPromises = [];
    
    // Create ~200 random bookings scattered across upcoming days and users
    for(let i = 0; i < 200; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const train = trains[Math.floor(Math.random() * trains.length)];
        const route = routes.find(r => r._id.equals(train.route));
        
        if (!route) continue;
        
        const coach = train.coaches[Math.floor(Math.random() * train.coaches.length)];
        
        const isCancelled = Math.random() > 0.9;
        
        // Random date in the next 12 days
        const randomDayOffset = Math.floor(Math.random() * 12);
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + randomDayOffset);
        bookingDate.setHours(0, 0, 0, 0);

        bookingPromises.push({
          pnr: `PNR${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          userId: user._id,
          passengers: [{ 
            name: `${user.name.split(' ')[0]}'s Guest ${i}`, 
            age: 20 + Math.floor(Math.random() * 40), 
            gender: Math.random() > 0.5 ? "M" : "F", 
            bookingStatus: isCancelled ? "CAN" : "CNF", 
            currentStatus: isCancelled ? "CAN" : "CNF" 
          }],
          trainId: train._id,
          seatClass: coach.coachClass,
          fareDetails: { 
            baseFare: 1000, 
            reservationCharges: 50, 
            gst: 50, 
            convenienceFee: 30, 
            discount: 0, 
            totalFare: 1130 
          },
          pricePaid: 1130,
          journeyDate: bookingDate,
          status: isCancelled ? "CANCELLED" : "CONFIRMED",
          paymentStatus: isCancelled ? "REFUNDED" : "COMPLETED"
        });
    }

    await Booking.insertMany(bookingPromises);

    console.log("Success! Database has been refreshed with data for the next 12 days.");
    process.exit(0);
  } catch (error) {
    console.error("Error refreshing database:", error);
    process.exit(1);
  }
};

run();
