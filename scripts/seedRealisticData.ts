import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User";
import { Station } from "../models/Station";
import { Route } from "../models/Route";
import { Train } from "../models/Train";
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

    console.log("Clearing existing sample data (keeping admin user and recruiter user)...");
    await User.deleteMany({ role: "user", email: { $ne: "hvdpvd4@gmail.com" } });
    await Station.deleteMany({});
    await Route.deleteMany({});
    await Train.deleteMany({});
    await Booking.deleteMany({});
    await SeatInventory.deleteMany({});

    console.log("Creating realistic users...");
    const userNames = [
      "Rahul Sharma", "Priya Patel", "Amit Kumar", "Sneha Desai", "Vikram Singh",
      "Kavita Reddy", "Arjun Nair", "Meera Menon", "Suresh Iyer", "Anjali Gupta",
      "Karan Chawla", "Neha Joshi", "Ravi Verma", "Pooja Bhatia", "Manoj Tiwari"
    ];
    
    // Hash passwords for seeded users so they can actually log in
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash("password123", 10);
    
    const usersData = userNames.map((name, i) => ({
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@gmail.com`,
      password: hash,
      role: "user"
    }));
    
    const users = await User.insertMany(usersData);

    console.log("Creating Indian Railway Stations...");
    const stationData = [
      { name: "New Delhi", code: "NDLS", city: "Delhi", state: "Delhi" },
      { name: "Mumbai Central", code: "MMCT", city: "Mumbai", state: "Maharashtra" },
      { name: "Howrah Junction", code: "HWH", city: "Kolkata", state: "West Bengal" },
      { name: "Chennai Central", code: "MAS", city: "Chennai", state: "Tamil Nadu" },
      { name: "KSR Bengaluru", code: "SBC", city: "Bengaluru", state: "Karnataka" },
      { name: "Pune Junction", code: "PUNE", city: "Pune", state: "Maharashtra" },
      { name: "Hyderabad Deccan", code: "HYB", city: "Hyderabad", state: "Telangana" },
      { name: "Ahmedabad Jn", code: "ADI", city: "Ahmedabad", state: "Gujarat" },
      { name: "Jaipur Jn", code: "JP", city: "Jaipur", state: "Rajasthan" },
      { name: "Lucknow NR", code: "LKO", city: "Lucknow", state: "Uttar Pradesh" },
      { name: "Bhopal Jn", code: "BPL", city: "Bhopal", state: "Madhya Pradesh" },
      { name: "Patna Jn", code: "PNBE", city: "Patna", state: "Bihar" },
      { name: "Guwahati", code: "GHY", city: "Guwahati", state: "Assam" },
      { name: "Bhubaneswar", code: "BBS", city: "Bhubaneswar", state: "Odisha" },
      { name: "Visakhapatnam", code: "VSKP", city: "Visakhapatnam", state: "Andhra Pradesh" },
      { name: "Thiruvananthapuram Central", code: "TVC", city: "Thiruvananthapuram", state: "Kerala" },
      { name: "Ernakulam Jn", code: "ERS", city: "Kochi", state: "Kerala" },
      { name: "Nagpur Jn", code: "NGP", city: "Nagpur", state: "Maharashtra" },
      { name: "Kanpur Central", code: "CNB", city: "Kanpur", state: "Uttar Pradesh" },
      { name: "Chandigarh", code: "CDG", city: "Chandigarh", state: "Chandigarh" }
    ];
    
    const stations = await Station.insertMany(stationData);
    const sMap: Record<string, any> = {};
    stations.forEach(s => sMap[s.code] = s._id);

    console.log("Creating highly realistic routes...");
    const routesData = [
      {
        routeName: "Delhi to Mumbai (via Kota, Vadodara)",
        source: sMap["NDLS"], destination: sMap["MMCT"], totalDistance: 1384,
        stations: [
          { station: sMap["NDLS"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["MMCT"], sequenceNumber: 2, distanceFromSource: 1384, haltDuration: 0 }
        ]
      },
      {
        routeName: "Delhi to Chennai (Grand Trunk Route)",
        source: sMap["NDLS"], destination: sMap["MAS"], totalDistance: 2182,
        stations: [
          { station: sMap["NDLS"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["BPL"], sequenceNumber: 2, distanceFromSource: 700, haltDuration: 10 },
          { station: sMap["NGP"], sequenceNumber: 3, distanceFromSource: 1090, haltDuration: 15 },
          { station: sMap["MAS"], sequenceNumber: 4, distanceFromSource: 2182, haltDuration: 0 }
        ]
      },
      {
        routeName: "Delhi to Kolkata (Howrah Rajdhani Route)",
        source: sMap["NDLS"], destination: sMap["HWH"], totalDistance: 1523,
        stations: [
          { station: sMap["NDLS"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["CNB"], sequenceNumber: 2, distanceFromSource: 440, haltDuration: 10 },
          { station: sMap["PNBE"], sequenceNumber: 3, distanceFromSource: 1000, haltDuration: 10 },
          { station: sMap["HWH"], sequenceNumber: 4, distanceFromSource: 1523, haltDuration: 0 }
        ]
      },
      {
        routeName: "Mumbai to Bengaluru (Udyan Route)",
        source: sMap["MMCT"], destination: sMap["SBC"], totalDistance: 1144,
        stations: [
          { station: sMap["MMCT"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["PUNE"], sequenceNumber: 2, distanceFromSource: 152, haltDuration: 5 },
          { station: sMap["SBC"], sequenceNumber: 3, distanceFromSource: 1144, haltDuration: 0 }
        ]
      },
      {
        routeName: "Kolkata to Chennai (Coromandel Route)",
        source: sMap["HWH"], destination: sMap["MAS"], totalDistance: 1661,
        stations: [
          { station: sMap["HWH"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["BBS"], sequenceNumber: 2, distanceFromSource: 437, haltDuration: 10 },
          { station: sMap["VSKP"], sequenceNumber: 3, distanceFromSource: 881, haltDuration: 20 },
          { station: sMap["MAS"], sequenceNumber: 4, distanceFromSource: 1661, haltDuration: 0 }
        ]
      },
      {
        routeName: "Bengaluru to Chennai (Shatabdi Route)",
        source: sMap["SBC"], destination: sMap["MAS"], totalDistance: 359,
        stations: [
          { station: sMap["SBC"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["MAS"], sequenceNumber: 2, distanceFromSource: 359, haltDuration: 0 }
        ]
      },
      {
        routeName: "Mumbai to Ahmedabad (Shatabdi Route)",
        source: sMap["MMCT"], destination: sMap["ADI"], totalDistance: 493,
        stations: [
          { station: sMap["MMCT"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["ADI"], sequenceNumber: 2, distanceFromSource: 493, haltDuration: 0 }
        ]
      },
      {
        routeName: "Delhi to Chandigarh (Shatabdi Route)",
        source: sMap["NDLS"], destination: sMap["CDG"], totalDistance: 266,
        stations: [
          { station: sMap["NDLS"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["CDG"], sequenceNumber: 2, distanceFromSource: 266, haltDuration: 0 }
        ]
      },
      {
        routeName: "Delhi to Guwahati (Rajdhani Route)",
        source: sMap["NDLS"], destination: sMap["GHY"], totalDistance: 1974,
        stations: [
          { station: sMap["NDLS"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["CNB"], sequenceNumber: 2, distanceFromSource: 440, haltDuration: 10 },
          { station: sMap["LKO"], sequenceNumber: 3, distanceFromSource: 512, haltDuration: 10 },
          { station: sMap["GHY"], sequenceNumber: 4, distanceFromSource: 1974, haltDuration: 0 }
        ]
      },
      {
        routeName: "Bengaluru to Thiruvananthapuram",
        source: sMap["SBC"], destination: sMap["TVC"], totalDistance: 833,
        stations: [
          { station: sMap["SBC"], sequenceNumber: 1, distanceFromSource: 0, haltDuration: 0 },
          { station: sMap["ERS"], sequenceNumber: 2, distanceFromSource: 615, haltDuration: 5 },
          { station: sMap["TVC"], sequenceNumber: 3, distanceFromSource: 833, haltDuration: 0 }
        ]
      }
    ];
    
    const routes = await Route.insertMany(routesData);

    console.log("Creating 20+ Genuine Trains...");
    const trainsData = [
      // NDLS - MMCT
      { trainNumber: "12952", name: "Mumbai Rajdhani", route: routes[0]._id, departureTime: "16:55", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 2.5, coaches: [{ coachClass: "1A", capacity: 24 }, { coachClass: "2A", capacity: 108 }, { coachClass: "3A", capacity: 256 }] },
      { trainNumber: "12910", name: "Garib Rath Express", route: routes[0]._id, departureTime: "15:35", runningDays: [3, 5, 6], basePricePerKm: 1.1, coaches: [{ coachClass: "3A", capacity: 350 }, { coachClass: "CC", capacity: 150 }] },
      
      // NDLS - MAS
      { trainNumber: "12616", name: "Grand Trunk Express", route: routes[1]._id, departureTime: "16:10", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 1.2, coaches: [{ coachClass: "1A", capacity: 18 }, { coachClass: "2A", capacity: 54 }, { coachClass: "3A", capacity: 144 }, { coachClass: "SL", capacity: 300 }] },
      { trainNumber: "12434", name: "Chennai Rajdhani", route: routes[1]._id, departureTime: "15:30", runningDays: [3, 5], basePricePerKm: 2.6, coaches: [{ coachClass: "1A", capacity: 24 }, { coachClass: "2A", capacity: 96 }, { coachClass: "3A", capacity: 200 }] },

      // NDLS - HWH
      { trainNumber: "12302", name: "Howrah Rajdhani", route: routes[2]._id, departureTime: "16:50", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 2.4, coaches: [{ coachClass: "1A", capacity: 18 }, { coachClass: "2A", capacity: 96 }, { coachClass: "3A", capacity: 320 }] },
      { trainNumber: "12324", name: "Howrah Express", route: routes[2]._id, departureTime: "07:00", runningDays: [2, 5], basePricePerKm: 1.0, coaches: [{ coachClass: "2A", capacity: 48 }, { coachClass: "3A", capacity: 120 }, { coachClass: "SL", capacity: 400 }, { coachClass: "GN", capacity: 300 }] },

      // MMCT - SBC
      { trainNumber: "11301", name: "Udyan Express", route: routes[3]._id, departureTime: "08:10", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 1.15, coaches: [{ coachClass: "1A", capacity: 10 }, { coachClass: "2A", capacity: 46 }, { coachClass: "3A", capacity: 128 }, { coachClass: "SL", capacity: 320 }] },
      
      // HWH - MAS
      { trainNumber: "12841", name: "Coromandel Express", route: routes[4]._id, departureTime: "15:20", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 1.3, coaches: [{ coachClass: "1A", capacity: 18 }, { coachClass: "2A", capacity: 64 }, { coachClass: "3A", capacity: 192 }, { coachClass: "SL", capacity: 280 }] },
      { trainNumber: "22807", name: "MAS AC Express", route: routes[4]._id, departureTime: "19:00", runningDays: [2, 5], basePricePerKm: 1.8, coaches: [{ coachClass: "1A", capacity: 20 }, { coachClass: "2A", capacity: 96 }, { coachClass: "3A", capacity: 256 }] },

      // SBC - MAS
      { trainNumber: "12028", name: "Shatabdi Express", route: routes[5]._id, departureTime: "06:00", runningDays: [0, 1, 3, 4, 5, 6], basePricePerKm: 2.2, coaches: [{ coachClass: "EC", capacity: 46 }, { coachClass: "CC", capacity: 350 }] },
      { trainNumber: "12640", name: "Brindavan Express", route: routes[5]._id, departureTime: "15:10", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 1.1, coaches: [{ coachClass: "CC", capacity: 150 }, { coachClass: "2S", capacity: 400 }, { coachClass: "GN", capacity: 200 }] },
      
      // MMCT - ADI
      { trainNumber: "12009", name: "Shatabdi Express", route: routes[6]._id, departureTime: "06:20", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 2.1, coaches: [{ coachClass: "EC", capacity: 54 }, { coachClass: "CC", capacity: 412 }] },
      { trainNumber: "12931", name: "Double Decker Exp", route: routes[6]._id, departureTime: "14:20", runningDays: [1, 2, 3, 4, 5, 6], basePricePerKm: 1.7, coaches: [{ coachClass: "CC", capacity: 600 }] },

      // NDLS - CDG
      { trainNumber: "12045", name: "Chandigarh Shatabdi", route: routes[7]._id, departureTime: "19:15", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 2.0, coaches: [{ coachClass: "EC", capacity: 46 }, { coachClass: "CC", capacity: 280 }] },
      
      // NDLS - GHY
      { trainNumber: "12424", name: "Dibrugarh Rajdhani", route: routes[8]._id, departureTime: "16:20", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 2.4, coaches: [{ coachClass: "1A", capacity: 18 }, { coachClass: "2A", capacity: 96 }, { coachClass: "3A", capacity: 256 }] },
      
      // SBC - TVC
      { trainNumber: "16315", name: "Kochuveli Express", route: routes[9]._id, departureTime: "16:50", runningDays: [0, 1, 2, 3, 4, 5, 6], basePricePerKm: 1.2, coaches: [{ coachClass: "2A", capacity: 48 }, { coachClass: "3A", capacity: 128 }, { coachClass: "SL", capacity: 360 }, { coachClass: "GN", capacity: 150 }] }
    ];
    
    const trains = await Train.insertMany(trainsData);

    console.log("Creating Massive Seat Inventory across 12 Days...");
    const inventoryData = [];
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

    console.log("Creating Big Data Bookings (Simulating Network Load)...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookingPromises = [];
    
    // Create ~150 random bookings scattered across trains and users
    for(let i = 0; i < 150; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const train = trains[Math.floor(Math.random() * trains.length)];
        const route = routes.find(r => r._id.equals(train.route))!;
        const coach = train.coaches[Math.floor(Math.random() * train.coaches.length)];
        
        const isCancelled = Math.random() > 0.9;
        
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
          journeyDate: today,
          status: isCancelled ? "CANCELLED" : "CONFIRMED",
          paymentStatus: isCancelled ? "REFUNDED" : "COMPLETED"
        });
    }

    await Booking.insertMany(bookingPromises);

    console.log("Big Data Seeding Completed Successfully! You now have a massive, realistic railway network.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

run();
