import { Router } from 'express';

import {
  createRoleController,
  getAllRolesController,
  getRoleByIdController,
  updateRoleController,
  deleteRoleController,
  assignPermissionsToRoleController,
  getAllPermissionsController,
  assignRoleToUserController,
  resetUserPermissionsController,
  addUserPermissionsController,
  removeUserPermissionsController,
} from '../controllers/role.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../types/enums';

const router = Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Role management routes (Admin only)
router.post(
  '/create',
  requirePermission(Permission.ROLE_CREATE),
  createRoleController,
);
router.get(
  '/getAll',
  requirePermission(Permission.ROLE_VIEW),
  getAllRolesController,
);
router.get(
  '/getById/:id',
  requirePermission(Permission.ROLE_VIEW),
  getRoleByIdController,
);
router.put(
  '/update/:id',
  requirePermission(Permission.ROLE_UPDATE),
  updateRoleController,
);
router.delete(
  '/delete/:id',
  requirePermission(Permission.ROLE_DELETE),
  deleteRoleController,
);

// Permission assignment routes
router.put(
  '/assign/:id/permissions',
  requirePermission(Permission.PERMISSION_ASSIGN),
  assignPermissionsToRoleController,
);

// Get all available permissions
router.get(
  '/permissions/all',
  requirePermission(Permission.ROLE_VIEW),
  getAllPermissionsController,
);

// User role and permission management
router.put(
  '/users/assign',
  requirePermission(Permission.PERMISSION_ASSIGN),
  assignRoleToUserController,
);
router.put(
  '/users/:userId/permissions/reset',
  requirePermission(Permission.PERMISSION_ASSIGN),
  resetUserPermissionsController,
);
router.put(
  '/users/:userId/permissions/add',
  requirePermission(Permission.PERMISSION_ASSIGN),
  addUserPermissionsController,
);
router.put(
  '/users/:userId/permissions/remove',
  requirePermission(Permission.PERMISSION_ASSIGN),
  removeUserPermissionsController,
);

export default router;
