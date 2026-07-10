const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing in .env");
}

const SeatInventorySchema = new mongoose.Schema({
  train: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  journeyDate: { type: Date, required: true },
  coachClass: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  racSeats: { type: Number, default: 0 },
  wlSeats: { type: Number, default: 0 },
  racCount: { type: Number, default: 0 },
  wlCount: { type: Number, default: 0 },
  baseFare: { type: Number, required: true },
}, { timestamps: true });

const SeatInventory = mongoose.models.SeatInventory || mongoose.model('SeatInventory', SeatInventorySchema);

// Need to just grab some trains and create inventory for them.
const TrainSchema = new mongoose.Schema({}, { strict: false });
const Train = mongoose.models.Train || mongoose.model('Train', TrainSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB...");

  const trains = await Train.find().limit(3);
  if (trains.length === 0) {
    console.log("No trains found. Please run seed-demo.js first.");
    process.exit();
  }

  // We will seed inventory for July 30, 2026 (the date in user's request)
  const targetDate = new Date("2026-07-30T00:00:00.000Z");

  for (const train of trains) {
    // Check if inventory already exists for this train/date/1A
    let inv = await SeatInventory.findOne({ train: train._id, journeyDate: targetDate, coachClass: "1A" });
    if (!inv) {
      inv = new SeatInventory({
        train: train._id,
        route: train.route, // Make sure route exists, but if not we can just fake an objectId
        journeyDate: targetDate,
        coachClass: "1A",
        totalSeats: 3,     // extremely small so RAC hits quickly
        availableSeats: 3, 
        racSeats: 2,       // 2 RAC spots
        wlSeats: 100,
        racCount: 0,
        wlCount: 0,
        baseFare: 1500
      });
      await inv.save();
      console.log(`Created 1A inventory for train ${train.trainNumber} (Seats: 3 CNF, 2 RAC)`);
    } else {
      inv.totalSeats = 3;
      inv.racSeats = 2;
      await inv.save();
      console.log(`Updated 1A inventory for train ${train.trainNumber} to Seats: 3 CNF, 2 RAC`);
    }
  }

  console.log("Done seeding Waitlist capacities!");
  process.exit();
}

seed().catch(console.error);
