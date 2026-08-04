import { model, Schema, type Types } from 'mongoose';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export interface IRentalApplication {
  _id: Types.ObjectId;
  property: Types.ObjectId;
  applicant: Types.ObjectId;
  landlord: Types.ObjectId;
  desiredMoveInDate: Date;
  monthlyIncome: number;
  employmentStatus: string;
  employer?: string;
  occupants: number;
  message?: string;
  status: ApplicationStatus;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
const schema = new Schema<IRentalApplication>(
  {
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    landlord: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    desiredMoveInDate: { type: Date, required: true },
    monthlyIncome: { type: Number, required: true, min: 0 },
    employmentStatus: { type: String, required: true },
    employer: String,
    occupants: { type: Number, min: 1, required: true },
    message: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
  },
  { timestamps: true },
);
schema.index(
  { property: 1, applicant: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } },
);
export const RentalApplication = model<IRentalApplication>('RentalApplication', schema);
