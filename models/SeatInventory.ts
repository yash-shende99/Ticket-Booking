import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatInventory extends Document {
  train: mongoose.Types.ObjectId;
  route: mongoose.Types.ObjectId;
  journeyDate: Date;
  coachClass: '1A' | '2A' | '3A' | 'SL' | 'CC' | 'GN';
  totalSeats: number;
  availableSeats: number;
  racSeats: number; // RAC capacity
  wlSeats: number; // Waitlist capacity
  racCount: number; // Current RAC bookings
  wlCount: number; // Current WL bookings
  baseFare: number;
}

const SeatInventorySchema: Schema = new Schema({
  train: { type: Schema.Types.ObjectId, ref: 'Train', required: true },
  route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  journeyDate: { type: Date, required: true },
  coachClass: { type: String, enum: ['1A', '2A', '3A', 'SL', 'CC', 'GN'], required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  racSeats: { type: Number, default: 0 },
  wlSeats: { type: Number, default: 0 },
  racCount: { type: Number, default: 0 },
  wlCount: { type: Number, default: 0 },
  baseFare: { type: Number, required: true },
}, { timestamps: true });

// Prevent duplicate inventory for the same train, date and class
SeatInventorySchema.index({ train: 1, journeyDate: 1, coachClass: 1 }, { unique: true });

export const SeatInventory = mongoose.models.SeatInventory || mongoose.model<ISeatInventory>('SeatInventory', SeatInventorySchema);
