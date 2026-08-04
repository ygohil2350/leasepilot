import { Property, type IProperty } from '../models/Property.js';
import { AppError } from '../utils/AppError.js';

type Query = Record<string, unknown>;
export const listProperties = async (query: Query, user?: { id: string; role: string }) => {
  const filter: Record<string, unknown> = {};
  if (query.q) filter.$text = { $search: query.q };
  if (query.city)
    filter.city = new RegExp(`^${String(query.city).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (query.status) filter.listingStatus = query.status;
  else if (user?.role !== 'landlord') filter.listingStatus = 'available';
  if (user?.role === 'landlord') filter.landlord = user.id;
  const range = (min: unknown, max: unknown) => ({
    ...(min !== undefined && { $gte: min }),
    ...(max !== undefined && { $lte: max }),
  });
  if (query.minRent !== undefined || query.maxRent !== undefined)
    filter.monthlyRent = range(query.minRent, query.maxRent);
  if (query.minArea !== undefined || query.maxArea !== undefined)
    filter.areaSqFt = range(query.minArea, query.maxArea);
  if (query.minBedrooms !== undefined) filter.bedrooms = { $gte: query.minBedrooms };
  if (query.minBathrooms !== undefined) filter.bathrooms = { $gte: query.minBathrooms };
  if (query.amenities)
    filter.amenities = {
      $all: Array.isArray(query.amenities) ? query.amenities : String(query.amenities).split(','),
    };
  const sorts: Record<string, Record<string, 1 | -1>> = {
    price_asc: { monthlyRent: 1 },
    price_desc: { monthlyRent: -1 },
    size: { areaSqFt: -1 },
    newest: { createdAt: -1 },
    name: { title: 1 },
  };
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 12);
  const [items, total] = await Promise.all([
    Property.find(filter)
      .sort(sorts[String(query.sort)] ?? sorts.newest)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Property.countDocuments(filter),
  ]);
  return { items, meta: { page, pageSize, total, pages: Math.ceil(total / pageSize) } };
};
export const getProperty = async (id: string) => {
  const item = await Property.findById(id).lean();
  if (!item) throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property not found');
  return item;
};
const slugify = (value: string) =>
  `${value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
export const createProperty = (
  landlord: string,
  input: Omit<IProperty, '_id' | 'landlord' | 'slug' | 'createdAt' | 'updatedAt'>,
) => Property.create({ ...input, landlord, slug: slugify(input.title) });
export const updateProperty = async (id: string, landlord: string, input: Partial<IProperty>) => {
  const item = await Property.findOneAndUpdate({ _id: id, landlord }, input, {
    new: true,
    runValidators: true,
  });
  if (!item)
    throw new AppError(404, 'PROPERTY_NOT_FOUND', 'Property was not found or is not owned by you');
  return item;
};
export const archiveProperty = (id: string, landlord: string) =>
  updateProperty(id, landlord, { listingStatus: 'archived' });
