import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as service from '../services/applicationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { applicationSchema, applicationStatusSchema, idSchema } from '../validators/schemas.js';
const router = Router();
router.use(authenticate);
router.post(
  '/',
  authorize('applicant', 'tenant'),
  validate(applicationSchema),
  asyncHandler(async (req, res) =>
    ok(res, await service.createApplication(req.user!.id, req.body), 201),
  ),
);
router.get(
  '/',
  asyncHandler(async (req, res) => ok(res, await service.listApplications(req.user!))),
);
router.get(
  '/:id',
  validate(idSchema),
  asyncHandler(async (req, res) =>
    ok(res, await service.getApplication(String(req.params.id), req.user!)),
  ),
);
router.patch(
  '/:id/status',
  authorize('landlord'),
  validate(applicationStatusSchema),
  asyncHandler(async (req, res) =>
    ok(
      res,
      await service.reviewApplication(
        String(req.params.id),
        req.user!.id,
        req.body.status,
        req.body.rejectionReason,
      ),
    ),
  ),
);
export default router;
