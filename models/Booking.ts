import mongoose, { Schema, Document } from 'mongoose';

export interface IPassenger {
  name: string;
  age: number;
  gender: string;
  nationality?: string;
  idType?: string;
  idNumber?: string;
  mealPreference?: string;
  berthPreference?: string;
  isSeniorCitizen?: boolean;
  isStudent?: boolean;
  isDisabled?: boolean;
  isInfant?: boolean;
  // Allocation results
  allocatedCoach?: string;
  allocatedSeat?: number;
  allocatedBerthType?: string;
  // WL/RAC Engine
  bookingStatus?: string; // e.g., CNF, RAC, WL
  currentStatus?: string; // e.g., CNF, RAC, WL
  queuePosition?: number; // e.g., 1 (WL 1), 2 (RAC 2)
}

export interface IFareDetails {
  baseFare: number;
  reservationCharges: number;
  gst: number;
  convenienceFee: number;
  discount: number;
  totalFare: number;
}

export interface IBooking extends Document {
  pnr: string;
  userId?: mongoose.Types.ObjectId; // For phase 1 later
  passengers: IPassenger[];
  trainId: mongoose.Types.ObjectId;
  seatClass: string;
  fareDetails: IFareDetails;
  pricePaid: number; // legacy/total
  journeyDate: Date;
  status: string;
  paymentStatus: string;
  emergencyContact?: string;
}

const PassengerSchema = new Schema<IPassenger>({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  nationality: { type: String, default: "Indian" },
  idType: { type: String },
  idNumber: { type: String },
  mealPreference: { type: String },
  berthPreference: { type: String },
  isSeniorCitizen: { type: Boolean, default: false },
  isStudent: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  isInfant: { type: Boolean, default: false },
  // Seat Allocation fields
  allocatedCoach: { type: String },
  allocatedSeat: { type: Number },
  allocatedBerthType: { type: String },
  bookingStatus: { type: String, default: 'CNF' },
  currentStatus: { type: String, default: 'CNF' },
  queuePosition: { type: Number, default: 0 },
});

const BookingSchema: Schema = new Schema({
  pnr: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  passengers: { type: [PassengerSchema], required: true },
  trainId: { type: Schema.Types.ObjectId, ref: 'Train', required: true },
  seatClass: { type: String, required: true },
  fareDetails: {
    baseFare: { type: Number, required: true },
    reservationCharges: { type: Number, required: true },
    gst: { type: Number, required: true },
    convenienceFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalFare: { type: Number, required: true }
  },
  pricePaid: { type: Number, required: true },
  journeyDate: { type: Date, required: true, default: Date.now },
  status: { type: String, default: "CONFIRMED" },
  paymentStatus: { type: String, default: "PENDING" },
  emergencyContact: { type: String }
}, { timestamps: true });

if (mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
