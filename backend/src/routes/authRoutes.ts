import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { User } from '../models/User.js';
import * as auth from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { ok } from '../utils/response.js';
import { loginSchema, registerSchema } from '../validators/schemas.js';
const router = Router();
const limiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
router.post(
  '/register',
  limiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => ok(res, await auth.register(req.body), 201)),
);
router.post(
  '/login',
  limiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => ok(res, await auth.login(req.body.email, req.body.password))),
);
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?.id);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    return ok(res, user);
  }),
);
router.post('/logout', authenticate, (_req, res) => ok(res, { message: 'Logged out' }));
export default router;
