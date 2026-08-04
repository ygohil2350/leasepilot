import mongoose from 'mongoose';
import { Property } from '../models/Property.js';
import { RentalApplication, type ApplicationStatus } from '../models/RentalApplication.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const createApplication = async (applicant: string, input: Record<string, unknown>) => {
  const property = await Property.findOne({ _id: input.property, listingStatus: 'available' });
  if (!property)
    throw new AppError(409, 'PROPERTY_UNAVAILABLE', 'This property is no longer available');
  if (await RentalApplication.exists({ property: property._id, applicant, status: 'pending' }))
    throw new AppError(
      409,
      'DUPLICATE_APPLICATION',
      'You already have a pending application for this property',
    );
  return RentalApplication.create({ ...input, applicant, landlord: property.landlord });
};
export const listApplications = (user: { id: string; role: string }) =>
  RentalApplication.find(user.role === 'landlord' ? { landlord: user.id } : { applicant: user.id })
    .populate('property', 'title city monthlyRent imageUrls')
    .populate('applicant', 'fullName email phone')
    .sort({ createdAt: -1 })
    .lean();
export const getApplication = async (id: string, user: { id: string; role: string }) => {
  const item = await RentalApplication.findOne({
    _id: id,
    [user.role === 'landlord' ? 'landlord' : 'applicant']: user.id,
  })
    .populate('property')
    .populate('applicant', 'fullName email phone')
    .lean();
  if (!item) throw new AppError(404, 'APPLICATION_NOT_FOUND', 'Application not found');
  return item;
};
export const reviewApplication = async (
  id: string,
  landlord: string,
  status: Exclude<ApplicationStatus, 'pending'>,
  rejectionReason?: string,
) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const application = await RentalApplication.findOne({
        _id: id,
        landlord,
        status: 'pending',
      }).session(session);
      if (!application)
        throw new AppError(
          409,
          'APPLICATION_NOT_PENDING',
          'Application is not pending or is not owned by you',
        );
      if (status === 'approved') {
        const property = await Property.findOneAndUpdate(
          { _id: application.property, landlord, listingStatus: 'available' },
          { listingStatus: 'rented', currentTenant: application.applicant },
          { new: true, session },
        );
        if (!property)
          throw new AppError(409, 'PROPERTY_UNAVAILABLE', 'The property is no longer available');
        await User.updateOne(
          { _id: application.applicant },
          { role: 'tenant', activeProperty: property._id },
          { session },
        );
        await RentalApplication.updateMany(
          { property: property._id, status: 'pending', _id: { $ne: application._id } },
          {
            status: 'rejected',
            reviewedAt: new Date(),
            reviewedBy: landlord,
            rejectionReason: 'Another application was approved',
          },
          { session },
        );
      }
      application.status = status;
      application.reviewedAt = new Date();
      application.reviewedBy = new mongoose.Types.ObjectId(landlord);
      application.rejectionReason = rejectionReason;
      result = await application.save({ session });
    });
    return result;
  } finally {
    await session.endSession();
  }
};
