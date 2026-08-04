import { MaintenanceTicket } from '../models/MaintenanceTicket.js';
import { Property } from '../models/Property.js';
import { RentalApplication } from '../models/RentalApplication.js';
export const dashboard = async (user: { id: string; role: string }) => {
  if (user.role === 'landlord') {
    const [properties, pendingApplications, openTickets, emergencyTickets, recentApplications] =
      await Promise.all([
        Property.find({ landlord: user.id }).select('listingStatus').lean(),
        RentalApplication.countDocuments({ landlord: user.id, status: 'pending' }),
        MaintenanceTicket.countDocuments({ landlord: user.id, status: { $ne: 'resolved' } }),
        MaintenanceTicket.countDocuments({
          landlord: user.id,
          status: { $ne: 'resolved' },
          priority: 'emergency',
        }),
        RentalApplication.find({ landlord: user.id })
          .populate('property', 'title')
          .populate('applicant', 'fullName')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);
    const rented = properties.filter((p) => p.listingStatus === 'rented').length;
    return {
      totalProperties: properties.length,
      availableProperties: properties.filter((p) => p.listingStatus === 'available').length,
      rentedProperties: rented,
      occupancyPercentage: properties.length ? Math.round((rented / properties.length) * 100) : 0,
      pendingApplications,
      openTickets,
      emergencyTickets,
      recentApplications,
    };
  }
  const [applications, tickets, activeProperty] = await Promise.all([
    RentalApplication.find({ applicant: user.id }).sort({ createdAt: -1 }).limit(5).lean(),
    MaintenanceTicket.find({ tenant: user.id }).sort({ updatedAt: -1 }).limit(5).lean(),
    Property.findOne({ currentTenant: user.id }).lean(),
  ]);
  return {
    applications,
    openTickets: tickets.filter((t) => t.status !== 'resolved').length,
    recentTickets: tickets,
    activeProperty,
  };
};
