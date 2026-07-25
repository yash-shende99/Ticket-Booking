import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'PROMO';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['INFO', 'ALERT', 'PROMO'], default: 'INFO' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
