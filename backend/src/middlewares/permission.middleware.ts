import { Request, Response, NextFunction } from 'express';

import { Permission } from '../types/enums';
import {
  userHasPermission,
  userHasAnyPermission,
} from '../services/permission.service';

/**
 * Middleware to check if user has required permission
 */
export const requirePermission = (permission: Permission) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const userHasRequiredPermission = await userHasPermission(
        user.id,
        permission,
      );

      if (!userHasRequiredPermission) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permission.toLowerCase().replace(/_/g, ':'),
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of the required permissions
 */
export const requireAnyPermission = (permissions: Permission[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const hasAnyPermission = await userHasAnyPermission(user.id, permissions);

      if (!hasAnyPermission) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permissions.map(p => p.toLowerCase().replace(/_/g, ':')),
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user owns the resource or has admin permissions
 */
export const requireOwnershipOrAdmin = (
  getResourceUserId: (req: Request) => string | null,
  adminPermission: Permission = Permission.STAFF_MANAGE,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      // Check if user is admin
      const isAdmin = await userHasPermission(user.id, adminPermission);
      if (isAdmin) {
        next();
        return;
      }

      // Check if user owns the resource
      const resourceUserId = getResourceUserId(req);
      if (resourceUserId && resourceUserId === user.id) {
        next();
        return;
      }

      res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources',
      });
    } catch (error) {
      next(error);
    }
  };
};
