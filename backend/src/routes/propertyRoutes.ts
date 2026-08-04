import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as service from '../services/propertyService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import {
  createPropertySchema,
  idSchema,
  propertyQuerySchema,
  updatePropertySchema,
} from '../validators/schemas.js';
const router = Router();
router.get(
  '/',
  optionalAuthenticate,
  validate(propertyQuerySchema),
  asyncHandler(async (req, res) => ok(res, await service.listProperties(req.query, req.user))),
);
router.get(
  '/:id',
  validate(idSchema),
  asyncHandler(async (req, res) => ok(res, await service.getProperty(String(req.params.id)))),
);
router.post(
  '/',
  authenticate,
  authorize('landlord'),
  validate(createPropertySchema),
  asyncHandler(async (req, res) =>
    ok(res, await service.createProperty(req.user!.id, req.body), 201),
  ),
);
router.patch(
  '/:id',
  authenticate,
  authorize('landlord'),
  validate(updatePropertySchema),
  asyncHandler(async (req, res) =>
    ok(res, await service.updateProperty(String(req.params.id), req.user!.id, req.body)),
  ),
);
router.delete(
  '/:id',
  authenticate,
  authorize('landlord'),
  validate(idSchema),
  asyncHandler(async (req, res) =>
    ok(res, await service.archiveProperty(String(req.params.id), req.user!.id)),
  ),
);
export default router;
