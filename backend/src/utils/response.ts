import type { Response } from 'express';

export const ok = <T>(res: Response, data: T, status = 200): Response =>
  res.status(status).json({ data });
