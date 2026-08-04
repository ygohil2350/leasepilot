import { model, Schema, type Types } from 'mongoose';

export type ListingStatus = 'draft' | 'available' | 'rented' | 'archived';
export interface IProperty {
  _id: Types.ObjectId;
  landlord: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  monthlyRent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  amenities: string[];
  imageUrls: string[];
  mapPosition: { x: number; y: number };
  listingStatus: ListingStatus;
  availableFrom: Date;
  currentTenant?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IProperty>(
  {
    landlord: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    propertyType: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    areaSqFt: { type: Number, required: true, min: 1 },
    amenities: [{ type: String }],
    imageUrls: [{ type: String }],
    mapPosition: {
      x: { type: Number, min: 0, max: 100, required: true },
      y: { type: Number, min: 0, max: 100, required: true },
    },
    listingStatus: {
      type: String,
      enum: ['draft', 'available', 'rented', 'archived'],
      default: 'draft',
    },
    availableFrom: { type: Date, required: true },
    currentTenant: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);
schema.index({ title: 'text', address: 'text', city: 'text', description: 'text' });
schema.index({ listingStatus: 1, city: 1, monthlyRent: 1, bedrooms: 1, areaSqFt: 1 });
export const Property = model<IProperty>('Property', schema);
