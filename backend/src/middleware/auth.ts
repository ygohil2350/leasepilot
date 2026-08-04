import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { UserRole } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

interface TokenPayload {
  sub: string;
  role: UserRole;
}
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  if (!token) return next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required'));
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Authentication token is invalid or expired'));
  }
};
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Authentication token is invalid or expired'));
  }
};
export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role))
      return next(
        new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'),
      );
    next();
  };
