import { model, Schema, type Types } from 'mongoose';

export type UserRole = 'landlord' | 'tenant' | 'applicant';
export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  activeProperty?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['landlord', 'tenant', 'applicant'], default: 'applicant' },
    phone: String,
    avatarUrl: String,
    activeProperty: { type: Schema.Types.ObjectId, ref: 'Property' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as Partial<IUser>).passwordHash;
        return ret;
      },
    },
  },
);

export const User = model<IUser>('User', schema);
