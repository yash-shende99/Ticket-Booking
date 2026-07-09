import mongoose, { Schema, Document } from 'mongoose';

export interface ITrain extends Document {
  name: string;
  trainNumber: string;
  source: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  price1AC: number;
  price2AC: number;
  priceSleeper: number;
  priceGeneral: number;
}

const TrainSchema: Schema = new Schema({
  name: { type: String, required: true },
  trainNumber: { type: String, required: true, unique: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  price1AC: { type: Number, required: true },
  price2AC: { type: Number, required: true },
  priceSleeper: { type: Number, required: true },
  priceGeneral: { type: Number, required: true },
}, { timestamps: true });

export const Train = mongoose.models.Train || mongoose.model<ITrain>('Train', TrainSchema);
