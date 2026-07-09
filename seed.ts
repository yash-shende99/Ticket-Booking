import mongoose from "mongoose";
import "dotenv/config";
import { Train } from "./models/Train";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing");
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    // Clear existing
    await Train.deleteMany({});
    
    // Seed new trains
    const trains = [
      {
        name: 'Rajdhani Express',
        trainNumber: '12951',
        source: 'Mumbai Central',
        destination: 'New Delhi',
        departureTime: new Date(new Date().setHours(17, 0, 0, 0)),
        arrivalTime: new Date(new Date().setDate(new Date().getDate() + 1)), // Next day
        price1AC: 4000,
        price2AC: 2500,
        priceSleeper: 800,
        priceGeneral: 400,
      },
      {
        name: 'Shatabdi Express',
        trainNumber: '12009',
        source: 'Mumbai Central',
        destination: 'Ahmedabad',
        departureTime: new Date(new Date().setHours(6, 25, 0, 0)),
        arrivalTime: new Date(new Date().setHours(12, 45, 0, 0)),
        price1AC: 2000,
        price2AC: 1200,
        priceSleeper: 500,
        priceGeneral: 200,
      },
      {
        name: 'Vande Bharat Express',
        trainNumber: '22436',
        source: 'New Delhi',
        destination: 'Varanasi',
        departureTime: new Date(new Date().setHours(6, 0, 0, 0)),
        arrivalTime: new Date(new Date().setHours(14, 0, 0, 0)),
        price1AC: 3300,
        price2AC: 2200,
        priceSleeper: 1500,
        priceGeneral: 800,
      }
    ];

    await Train.insertMany(trains);
    console.log("Trains seeded successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
}

seed();
