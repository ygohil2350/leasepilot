import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export const notFound: RequestHandler = (_req, _res, next) =>
  next(new AppError(404, 'NOT_FOUND', 'Resource not found'));
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  void _next;
  let appError =
    error instanceof AppError
      ? error
      : new AppError(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  if (error instanceof mongoose.Error.CastError)
    appError = new AppError(400, 'INVALID_ID', 'Invalid resource identifier');
  if (error instanceof mongoose.Error.ValidationError)
    appError = new AppError(400, 'VALIDATION_ERROR', error.message);
  if (typeof error === 'object' && error && 'code' in error && error.code === 11000)
    appError = new AppError(
      409,
      'DUPLICATE_RESOURCE',
      'A resource with these values already exists',
    );
  res
    .status(appError.statusCode)
    .json({ error: { code: appError.code, message: appError.message, details: appError.details } });
};
