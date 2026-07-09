import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  pnr: string;
  passengerName: string;
  passengerAge: number;
  trainId: mongoose.Types.ObjectId;
  seatClass: string;
  pricePaid: number;
}

const BookingSchema: Schema = new Schema({
  pnr: { type: String, required: true, unique: true },
  passengerName: { type: String, required: true },
  passengerAge: { type: Number, required: true },
  trainId: { type: Schema.Types.ObjectId, ref: 'Train', required: true },
  seatClass: { type: String, required: true },
  pricePaid: { type: Number, required: true },
}, { timestamps: true });

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
