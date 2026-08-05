import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import { MaintenanceTicket } from './models/MaintenanceTicket.js';
import { Property } from './models/Property.js';
import { RentalApplication } from './models/RentalApplication.js';
import { User } from './models/User.js';

const images = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80',
];
const cities = ['Austin', 'Denver', 'Seattle', 'Portland'];
const titles = [
  'Sunlit Cedar Loft',
  'Juniper Garden Home',
  'Parkline Studio',
  'Harbor View Townhouse',
  'Terracotta House',
  'The Linden Flat',
  'Cobalt Corner',
  'Willow Courtyard',
  'Northstar Residence',
  'Sagebrush Bungalow',
  'Skyline Atelier',
  'Ember Row Home',
];

const run = async () => {
  await connectDatabase();
  const seedMetadata = mongoose.connection.collection<{ _id: string; seededAt: Date }>(
    'seed_metadata',
  );
  const seedId = 'leasepilot-demo-v1';
  if (await seedMetadata.findOne({ _id: seedId })) {
    console.log('Demo data already seeded; skipping.');
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash('Demo123!', 12);
  const landlord = await User.findOneAndUpdate(
    { email: 'landlord@leasepilot.demo' },
    {
      fullName: 'Maya Chen',
      email: 'landlord@leasepilot.demo',
      passwordHash,
      role: 'landlord',
      phone: '512-555-0101',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const tenant = await User.findOneAndUpdate(
    { email: 'tenant@leasepilot.demo' },
    {
      fullName: 'Noah Williams',
      email: 'tenant@leasepilot.demo',
      passwordHash,
      role: 'tenant',
      phone: '512-555-0102',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const applicant = await User.findOneAndUpdate(
    { email: 'applicant@leasepilot.demo' },
    {
      fullName: 'Priya Shah',
      email: 'applicant@leasepilot.demo',
      passwordHash,
      role: 'applicant',
      phone: '512-555-0103',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const properties = [];
  for (let i = 0; i < titles.length; i += 1) {
    const rented = i === 0;
    properties.push(
      await Property.findOneAndUpdate(
        { slug: `demo-property-${i + 1}` },
        {
          landlord: landlord._id,
          title: titles[i],
          slug: `demo-property-${i + 1}`,
          description: `A thoughtfully designed ${i % 3 === 0 ? 'townhouse' : 'apartment'} with natural light, practical storage, and quick access to neighborhood favorites.`,
          propertyType: i % 3 === 0 ? 'Townhouse' : i % 3 === 1 ? 'Apartment' : 'Condo',
          address: `${120 + i * 17} ${['Cedar', 'Market', 'Lake'][i % 3]} Street`,
          city: cities[i % cities.length],
          state: ['TX', 'CO', 'WA', 'OR'][i % 4],
          postalCode: `78${701 + i}`,
          monthlyRent: 1450 + i * 175,
          securityDeposit: 1200 + i * 100,
          bedrooms: 1 + (i % 4),
          bathrooms: 1 + (i % 2) * 0.5,
          areaSqFt: 620 + i * 95,
          amenities: [
            ['Parking', 'Pet friendly', 'In-unit laundry'],
            ['Gym', 'Rooftop', 'Doorman'],
            ['Garden', 'Fireplace', 'Storage'],
          ][i % 3],
          imageUrls: [images[i % 3], images[(i + 1) % 3], images[(i + 2) % 3]],
          mapPosition: { x: 12 + ((i * 23) % 78), y: 14 + ((i * 31) % 70) },
          listingStatus: rented ? 'rented' : 'available',
          availableFrom: new Date(Date.now() + (i + 1) * 86400000),
          ...(rented && { currentTenant: tenant._id }),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    );
  }
  await User.updateOne({ _id: tenant._id }, { activeProperty: properties[0]!._id });
  await RentalApplication.deleteMany({ applicant: { $in: [tenant._id, applicant._id] } });
  await RentalApplication.create([
    {
      property: properties[0]!._id,
      applicant: tenant._id,
      landlord: landlord._id,
      desiredMoveInDate: new Date(Date.now() + 864000000),
      monthlyIncome: 7200,
      employmentStatus: 'Employed',
      employer: 'Northwind Labs',
      occupants: 2,
      status: 'approved',
      reviewedAt: new Date(),
    },
    {
      property: properties[2]!._id,
      applicant: applicant._id,
      landlord: landlord._id,
      desiredMoveInDate: new Date(Date.now() + 1209600000),
      monthlyIncome: 6800,
      employmentStatus: 'Employed',
      employer: 'Atlas Studio',
      occupants: 1,
      status: 'pending',
    },
    {
      property: properties[4]!._id,
      applicant: applicant._id,
      landlord: landlord._id,
      desiredMoveInDate: new Date(Date.now() + 1209600000),
      monthlyIncome: 6800,
      employmentStatus: 'Employed',
      occupants: 1,
      status: 'rejected',
      rejectionReason: 'Move-in timing did not align',
    },
  ]);
  await MaintenanceTicket.deleteMany({ tenant: tenant._id });
  await MaintenanceTicket.create([
    {
      property: properties[0]!._id,
      tenant: tenant._id,
      landlord: landlord._id,
      title: 'Kitchen faucet leaking',
      description: 'The kitchen faucet drips steadily even when fully closed.',
      category: 'Plumbing',
      priority: 'medium',
      status: 'open',
      imageUrls: [],
    },
    {
      property: properties[0]!._id,
      tenant: tenant._id,
      landlord: landlord._id,
      title: 'Hallway light flickering',
      description: 'The ceiling fixture flickers after warming up.',
      category: 'Electrical',
      priority: 'high',
      status: 'in_progress',
      landlordNotes: 'Electrician scheduled for Thursday',
      imageUrls: [],
    },
    {
      property: properties[0]!._id,
      tenant: tenant._id,
      landlord: landlord._id,
      title: 'Bedroom window latch',
      description: 'The window latch was loose and would not lock.',
      category: 'Windows',
      priority: 'low',
      status: 'resolved',
      resolvedAt: new Date(),
      landlordNotes: 'Latch replaced',
      imageUrls: [],
    },
  ]);
  await seedMetadata.updateOne(
    { _id: seedId },
    { $set: { seededAt: new Date() } },
    { upsert: true },
  );
  console.log('Seed complete. Demo password: Demo123!');
  process.exit(0);
};
run().catch((error) => {
  console.error(error);
  process.exit(1);
});
