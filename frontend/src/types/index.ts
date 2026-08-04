export type Role = 'landlord' | 'tenant' | 'applicant';
export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  activeProperty?: string;
}
export interface Property {
  _id: string;
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
  listingStatus: 'draft' | 'available' | 'rented' | 'archived';
  availableFrom: string;
}
export interface RentalApplication {
  _id: string;
  property: Property;
  applicant: User;
  desiredMoveInDate: string;
  monthlyIncome: number;
  employmentStatus: string;
  occupants: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}
export interface Ticket {
  _id: string;
  property: Property;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'in_progress' | 'resolved';
  landlordNotes?: string;
  createdAt: string;
}
export interface ApiResponse<T> {
  data: T;
}
