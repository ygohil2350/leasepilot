import { MaintenanceTicket, type TicketStatus } from '../models/MaintenanceTicket.js';
import { Property } from '../models/Property.js';
import { AppError } from '../utils/AppError.js';

export const createTicket = async (tenant: string, input: Record<string, unknown>) => {
  const property = await Property.findOne({
    _id: input.property,
    currentTenant: tenant,
    listingStatus: 'rented',
  });
  if (!property)
    throw new AppError(
      403,
      'NOT_ACTIVE_TENANT',
      'Tickets can only be created for your active rental',
    );
  return MaintenanceTicket.create({ ...input, tenant, landlord: property.landlord });
};
export const listTickets = (user: { id: string; role: string }, query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = {
    [user.role === 'landlord' ? 'landlord' : 'tenant']: user.id,
  };
  for (const key of ['property', 'status', 'priority']) if (query[key]) filter[key] = query[key];
  return MaintenanceTicket.find(filter)
    .populate('property', 'title address')
    .sort({ createdAt: -1 })
    .lean();
};
export const getTicket = async (id: string, user: { id: string; role: string }) => {
  const item = await MaintenanceTicket.findOne({
    _id: id,
    [user.role === 'landlord' ? 'landlord' : 'tenant']: user.id,
  })
    .populate('property')
    .lean();
  if (!item) throw new AppError(404, 'TICKET_NOT_FOUND', 'Maintenance ticket not found');
  return item;
};
export const updateTenantTicket = async (
  id: string,
  tenant: string,
  input: Record<string, unknown>,
) => {
  const item = await MaintenanceTicket.findOneAndUpdate(
    { _id: id, tenant, status: 'open' },
    input,
    { new: true, runValidators: true },
  );
  if (!item) throw new AppError(409, 'TICKET_NOT_EDITABLE', 'Only your open tickets can be edited');
  return item;
};
export const deleteTenantTicket = async (id: string, tenant: string) => {
  const item = await MaintenanceTicket.findOneAndDelete({ _id: id, tenant, status: 'open' });
  if (!item)
    throw new AppError(409, 'TICKET_NOT_DELETABLE', 'Only your open tickets can be deleted');
};
const transitions: Record<TicketStatus, TicketStatus[]> = {
  open: ['in_progress'],
  in_progress: ['open', 'resolved'],
  resolved: [],
};
export const isAllowedTransition = (from: TicketStatus, to: TicketStatus): boolean =>
  transitions[from].includes(to);
export const updateTicketStatus = async (
  id: string,
  landlord: string,
  status: TicketStatus,
  landlordNotes?: string,
) => {
  const item = await MaintenanceTicket.findOne({ _id: id, landlord });
  if (!item)
    throw new AppError(
      404,
      'TICKET_NOT_FOUND',
      'Ticket was not found or is not associated with your property',
    );
  if (!isAllowedTransition(item.status, status))
    throw new AppError(
      409,
      'INVALID_STATUS_TRANSITION',
      `Cannot move a ticket from ${item.status} to ${status}`,
    );
  item.status = status;
  item.landlordNotes = landlordNotes ?? item.landlordNotes;
  item.resolvedAt = status === 'resolved' ? new Date() : undefined;
  return item.save();
};
