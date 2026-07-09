import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainCoach {
  coachClass: '1A' | '2A' | '3A' | 'SL' | 'CC' | 'GN';
  capacity: number;
}

export interface ITrain extends Document {
  trainNumber: string;
  name: string;
  route: mongoose.Types.ObjectId;
  departureTime: string;
  runningDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  coaches: ITrainCoach[];
  isActive: boolean;
  basePricePerKm: number;
}

const TrainCoachSchema = new Schema({
  coachClass: { type: String, enum: ['1A', '2A', '3A', 'SL', 'CC', 'GN'], required: true },
  capacity: { type: Number, required: true },
}, { _id: false });

const TrainSchema: Schema = new Schema({
  trainNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
  departureTime: { type: String, required: true },
  runningDays: [{ type: Number, min: 0, max: 6 }],
  coaches: [TrainCoachSchema],
  isActive: { type: Boolean, default: true },
  basePricePerKm: { type: Number, required: true, default: 1.5 },
}, { timestamps: true });

export const Train = mongoose.models.Train || mongoose.model<ITrain>('Train', TrainSchema);
