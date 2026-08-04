import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import {
  applicationSchema,
  loginSchema,
  propertyQuerySchema,
  registerSchema,
} from '../src/validators/schemas.js';
import { isAllowedTransition } from '../src/services/maintenanceService.js';
describe('system and security', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
  it('protects dashboard routes', async () => {
    const response = await request(app).get('/api/v1/dashboard');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });
  it('rejects malformed ids before database access', async () => {
    const response = await request(app).get('/api/v1/properties/not-an-id');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
describe('request validation', () => {
  it('requires a valid registration password and email', () => {
    expect(
      registerSchema.safeParse({
        body: { fullName: 'A', email: 'bad', password: 'tiny', role: 'landlord' },
      }).success,
    ).toBe(false);
  });
  it('validates login fields', () => {
    expect(
      loginSchema.safeParse({ body: { email: 'demo@example.com', password: 'Demo123!' } }).success,
    ).toBe(true);
  });
  it('limits property page size and sort values', () => {
    expect(
      propertyQuerySchema.safeParse({ query: { pageSize: '500', sort: 'random' } }).success,
    ).toBe(false);
  });
  it('requires future move-in dates', () => {
    expect(
      applicationSchema.safeParse({
        body: {
          property: '64b64c8b7f1a4c2f8c612345',
          desiredMoveInDate: '2020-01-01',
          monthlyIncome: 5000,
          employmentStatus: 'Employed',
          occupants: 1,
        },
      }).success,
    ).toBe(false);
  });
});
describe('maintenance workflow', () => {
  it('allows only supported status transitions', () => {
    expect(isAllowedTransition('open', 'in_progress')).toBe(true);
    expect(isAllowedTransition('in_progress', 'resolved')).toBe(true);
    expect(isAllowedTransition('open', 'resolved')).toBe(false);
    expect(isAllowedTransition('resolved', 'open')).toBe(false);
  });
});
