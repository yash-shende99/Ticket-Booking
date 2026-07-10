const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Update ALL SeatInventories for July 29th 18:30Z (which is July 30th IST) and July 30th to have tiny capacities
  const result = await mongoose.connection.collection('seatinventories').updateMany(
    { 
      $or: [
        { journeyDate: new Date("2026-07-29T18:30:00.000Z") },
        { journeyDate: new Date("2026-07-30T00:00:00.000Z") }
      ]
    },
    { 
      $set: { 
        totalSeats: 3,
        availableSeats: 3,
        racSeats: 2,
        wlSeats: 100,
        racCount: 0,
        wlCount: 0
      }
    }
  );
  
  console.log("Updated Seat Inventories:", result.modifiedCount);
  process.exit();
}

fix().catch(console.error);
