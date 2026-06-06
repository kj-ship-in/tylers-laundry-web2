import { Request, Response, NextFunction } from 'express';

import logger from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();

  logger.http(`${req.method} ${req.url} - ${req.ip}`);

  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    const size = Buffer.byteLength(body ?? '', 'utf8');

    logger.http(
      `${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ${size} bytes`,
    );

    return originalSend.call(this, body);
  };

  next();
};
