/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

import logger from '../utils/logger';

import { ValidationError } from './error.middleware';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        logger.warn('Validation failed:', {
          url: req.url,
          method: req.method,
          errors: errorMessages,
        });

        next(
          new ValidationError(
            `Validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          ),
        );
      } else {
        next(error);
      }
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({ ...req.query });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        logger.warn('Query validation failed:', {
          url: req.url,
          method: req.method,
          errors: errorMessages,
        });

        next(
          new ValidationError(
            `Query validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          ),
        );
      } else {
        next(error);
      }
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsedParams = schema.parse(req.params);
      req.params = parsedParams as any;
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        logger.warn('Params validation failed:', {
          url: req.url,
          method: req.method,
          errors: errorMessages,
        });

        next(
          new ValidationError(
            `Parameters validation failed: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(', ')}`,
          ),
        );
      } else {
        next(error);
      }
    }
  };
}
