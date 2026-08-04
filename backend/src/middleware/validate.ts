import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate =
  (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!parsed.success)
      return next(
        new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', parsed.error.issues),
      );
    const value = parsed.data as { body?: unknown; params?: unknown; query?: unknown };
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params as Request['params'];
    if (value.query) req.query = value.query as Request['query'];
    next();
  };
