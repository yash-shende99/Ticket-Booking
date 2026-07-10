const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const invs = await mongoose.connection.collection('seatinventories').find({ 
    coachClass: '1A' 
  }).toArray();
  
  console.log("SEAT INVENTORIES IN DB FOR 1A:");
  console.log(JSON.stringify(invs, null, 2));
  
  process.exit();
}

check().catch(console.error);
