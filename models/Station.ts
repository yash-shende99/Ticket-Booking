import mongoose, { Schema, Document } from 'mongoose';

export interface IStation extends Document {
  name: string;
  code: string;
  city: string;
  state: string;
  platforms: number;
}

const StationSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  platforms: { type: Number, default: 1 },
}, { timestamps: true });

export const Station = mongoose.models.Station || mongoose.model<IStation>('Station', StationSchema);
