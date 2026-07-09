import mongoose, { Schema, Document } from 'mongoose';

export interface IRouteStation {
  station: mongoose.Types.ObjectId;
  distanceFromSource: number; // in km
  haltDuration: number; // in minutes
  dayOffset: number; // 0 for same day, 1 for next day etc.
}

export interface IRoute extends Document {
  routeName: string;
  source: mongoose.Types.ObjectId;
  destination: mongoose.Types.ObjectId;
  stations: IRouteStation[];
}

const RouteStationSchema = new Schema({
  station: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  distanceFromSource: { type: Number, required: true },
  haltDuration: { type: Number, default: 0 },
  dayOffset: { type: Number, default: 0 }
}, { _id: false });

const RouteSchema: Schema = new Schema({
  routeName: { type: String, required: true },
  source: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  destination: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
  stations: [RouteStationSchema]
}, { timestamps: true });

export const Route = mongoose.models.Route || mongoose.model<IRoute>('Route', RouteSchema);
