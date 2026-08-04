import { model, Schema, type Types } from 'mongoose';

export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export interface IMaintenanceTicket {
  _id: Types.ObjectId;
  property: Types.ObjectId;
  tenant: Types.ObjectId;
  landlord: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: TicketStatus;
  imageUrls: string[];
  landlordNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const schema = new Schema<IMaintenanceTicket>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    landlord: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'emergency'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
    imageUrls: [{ type: String }],
    landlordNotes: String,
    resolvedAt: Date,
  },
  { timestamps: true },
);
schema.index({ landlord: 1, status: 1, priority: 1, createdAt: -1 });
export const MaintenanceTicket = model<IMaintenanceTicket>('MaintenanceTicket', schema);
