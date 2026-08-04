import { z } from 'zod';
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB ObjectId');
const idParams = z.object({ id: objectId });
export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['landlord', 'tenant', 'applicant']).default('applicant'),
    phone: z.string().optional(),
  }),
});
export const loginSchema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(1) }),
});
export const propertyQuerySchema = z.object({
  query: z.object({
    q: z.string().max(100).optional(),
    city: z.string().optional(),
    minRent: z.coerce.number().min(0).optional(),
    maxRent: z.coerce.number().min(0).optional(),
    minBedrooms: z.coerce.number().min(0).optional(),
    minBathrooms: z.coerce.number().min(0).optional(),
    minArea: z.coerce.number().min(0).optional(),
    maxArea: z.coerce.number().min(0).optional(),
    amenities: z.union([z.string(), z.array(z.string())]).optional(),
    status: z.enum(['draft', 'available', 'rented', 'archived']).optional(),
    sort: z.enum(['price_asc', 'price_desc', 'size', 'newest', 'name']).default('newest'),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(12),
  }),
});
export const propertyBody = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  propertyType: z.string().min(2),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  monthlyRent: z.number().nonnegative(),
  securityDeposit: z.number().nonnegative(),
  bedrooms: z.number().nonnegative(),
  bathrooms: z.number().nonnegative(),
  areaSqFt: z.number().positive(),
  amenities: z.array(z.string()).default([]),
  imageUrls: z.array(z.string().url()).min(1),
  mapPosition: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
  listingStatus: z.enum(['draft', 'available', 'rented', 'archived']),
  availableFrom: z.coerce.date(),
});
export const createPropertySchema = z.object({ body: propertyBody });
export const updatePropertySchema = z.object({ params: idParams, body: propertyBody.partial() });
export const idSchema = z.object({ params: idParams });
export const applicationSchema = z.object({
  body: z.object({
    property: objectId,
    desiredMoveInDate: z.coerce
      .date()
      .refine((d) => d > new Date(), 'Move-in date must be in the future'),
    monthlyIncome: z.number().nonnegative(),
    employmentStatus: z.string().min(2),
    employer: z.string().optional(),
    occupants: z.number().int().min(1).max(20),
    message: z.string().max(1000).optional(),
  }),
});
export const applicationStatusSchema = z.object({
  params: idParams,
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().max(500).optional(),
  }),
});
export const ticketSchema = z.object({
  body: z.object({
    property: objectId,
    title: z.string().min(3),
    description: z.string().min(10),
    category: z.string().min(2),
    priority: z.enum(['low', 'medium', 'high', 'emergency']),
    imageUrls: z.array(z.string().url()).default([]),
  }),
});
export const ticketUpdateSchema = z.object({
  params: idParams,
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    category: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
    imageUrls: z.array(z.string().url()).optional(),
  }),
});
export const ticketStatusSchema = z.object({
  params: idParams,
  body: z.object({
    status: z.enum(['open', 'in_progress', 'resolved']),
    landlordNotes: z.string().max(2000).optional(),
  }),
});
