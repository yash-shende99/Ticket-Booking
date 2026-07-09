import mongoose from "mongoose";
import "dotenv/config";
import { Station } from "./models/Station";
import { Route } from "./models/Route";
import { Train } from "./models/Train";
import { SeatInventory } from "./models/SeatInventory";
import { Booking } from "./models/Booking";

import { stationsData } from "./data/stations";
import { routesData } from "./data/routes";
import { trainsData } from "./data/trains";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing");
}

async function seedRealData() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Station.deleteMany({});
    await Route.deleteMany({});
    await Train.deleteMany({});
    await SeatInventory.deleteMany({});
    await Booking.deleteMany({});
    console.log("Cleared old data");

    // 1. Create Stations
    console.log(`Seeding ${stationsData.length} stations...`);
    const stations = await Station.insertMany(stationsData);
    
    const getStationId = (code: string) => {
      const station = stations.find(s => s.code === code);
      if (!station) throw new Error(`Station not found: ${code}`);
      return station._id;
    };

    // 2. Create Routes
    console.log(`Seeding ${routesData.length * 2} routes...`);
    const routeDocs = [];
    for (const r of routesData) {
      const sourceId = getStationId(r.source);
      const destId = getStationId(r.destination);
      
      // Forward Route
      routeDocs.push({
        routeName: r.name,
        source: sourceId,
        destination: destId,
        stations: [
          { station: sourceId, distanceFromSource: 0, haltDuration: 0, dayOffset: 0 },
          { station: destId, distanceFromSource: r.distance, haltDuration: 0, dayOffset: Math.floor(r.distance / 1000) }
        ]
      });

      // Reverse Route
      const reverseName = r.name.split('-').reverse().join('-');
      // Avoid duplicates if reverse was explicitly defined in data/routes.ts
      if (!routeDocs.find(rd => rd.routeName === reverseName)) {
        routeDocs.push({
          routeName: reverseName,
          source: destId,
          destination: sourceId,
          stations: [
            { station: destId, distanceFromSource: 0, haltDuration: 0, dayOffset: 0 },
            { station: sourceId, distanceFromSource: r.distance, haltDuration: 0, dayOffset: Math.floor(r.distance / 1000) }
          ]
        });
      }
    }
    const routes = await Route.insertMany(routeDocs);
    
    const getRouteId = (name: string) => {
      const route = routes.find(r => r.routeName === name);
      if (!route) throw new Error(`Route not found: ${name}`);
      return route._id;
    };

    // 3. Create Trains
    console.log(`Seeding ${trainsData.length} trains...`);
    const trainDocs = [];
    for (const t of trainsData) {
      let routeId;
      try {
        routeId = getRouteId(t.routeId);
      } catch (e) {
        console.log(`Skipping train ${t.name}, route not found: ${t.routeId}`);
        continue;
      }
      
      trainDocs.push({
        trainNumber: t.number,
        name: t.name,
        route: routeId,
        departureTime: t.dep,
        runningDays: t.days,
        basePricePerKm: 2.0, // Standardize base price
        isActive: true,
        coaches: [
          { coachClass: "1A", capacity: 24 },
          { coachClass: "2A", capacity: 54 },
          { coachClass: "3A", capacity: 72 },
          { coachClass: "SL", capacity: 200 }
        ]
      });
      
      // If a reverse route is defined, create the reverse train
      if (t.reverseRoute) {
        try {
          const reverseRouteId = getRouteId(t.reverseRoute);
          trainDocs.push({
            trainNumber: (parseInt(t.number) + 1).toString(),
            name: t.name + " (Reverse)",
            route: reverseRouteId,
            departureTime: "08:00",
            runningDays: t.days,
            basePricePerKm: 2.0,
            isActive: true,
            coaches: [
              { coachClass: "1A", capacity: 24 },
              { coachClass: "2A", capacity: 54 },
              { coachClass: "3A", capacity: 72 },
              { coachClass: "SL", capacity: 200 }
            ]
          });
        } catch (e) {
          console.log(`Skipping reverse route for ${t.name}, route not found: ${t.reverseRoute}`);
        }
      }
    }
    
    try {
      await Train.insertMany(trainDocs, { ordered: false });
    } catch (e: any) {
      if (e.code === 11000) {
        console.log("Some duplicate trains were skipped due to number collisions.");
      } else {
        throw e;
      }
    }

    console.log("Massive Real IRCTC Data Seeded Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedRealData();
