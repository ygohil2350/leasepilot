import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as service from '../services/maintenanceService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import {
  idSchema,
  ticketSchema,
  ticketStatusSchema,
  ticketUpdateSchema,
} from '../validators/schemas.js';
const router = Router();
router.use(authenticate);
router.post(
  '/',
  authorize('tenant'),
  validate(ticketSchema),
  asyncHandler(async (req, res) =>
    ok(res, await service.createTicket(req.user!.id, req.body), 201),
  ),
);
router.get(
  '/',
  asyncHandler(async (req, res) => ok(res, await service.listTickets(req.user!, req.query))),
);
router.get(
  '/:id',
  validate(idSchema),
  asyncHandler(async (req, res) =>
    ok(res, await service.getTicket(String(req.params.id), req.user!)),
  ),
);
router.patch(
  '/:id',
  authorize('tenant'),
  validate(ticketUpdateSchema),
  asyncHandler(async (req, res) =>
    ok(res, await service.updateTenantTicket(String(req.params.id), req.user!.id, req.body)),
  ),
);
router.patch(
  '/:id/status',
  authorize('landlord'),
  validate(ticketStatusSchema),
  asyncHandler(async (req, res) =>
    ok(
      res,
      await service.updateTicketStatus(
        String(req.params.id),
        req.user!.id,
        req.body.status,
        req.body.landlordNotes,
      ),
    ),
  ),
);
router.delete(
  '/:id',
  authorize('tenant'),
  validate(idSchema),
  asyncHandler(async (req, res) => {
    await service.deleteTenantTicket(String(req.params.id), req.user!.id);
    return ok(res, { message: 'Ticket deleted' });
  }),
);
export default router;
