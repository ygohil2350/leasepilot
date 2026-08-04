import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { dashboard } from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
const router = Router();
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => ok(res, await dashboard(req.user!))),
);
export default router;
