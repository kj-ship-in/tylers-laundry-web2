import { Request, Response, NextFunction } from 'express';

export const xssProtection = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    // Sanitize query parameters in place
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        const value = req.query[key];
        req.query[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }

  next();
};

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}
