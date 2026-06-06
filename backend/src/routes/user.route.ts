import express from 'express';

import {
  selfDeleteUserController,
  softDeleteUserController,
} from '../controllers/auth.controller';
import {
  getCustomersController,
  getStaffsController,
  updateUserRoleController,
  getCurrentUserController,
  updateProfileDetailsController,
  updateProfilePictureController,
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/multer.middleware';
import {
  requirePermission,
  requireAnyPermission,
} from '../middlewares/permission.middleware';
import { handleUploadError } from '../middlewares/upload-error.middleware';
import { Permission } from '../types/enums';

const router = express.Router();

router.use(authMiddleware);

// Profile routes - any authenticated user
router.get('/me', getCurrentUserController);
router.patch(
  '/profile-details',
  requirePermission(Permission.PROFILE_UPDATE_OWN),
  updateProfileDetailsController,
);
router.patch(
  '/profile-picture',
  requirePermission(Permission.PROFILE_UPDATE_OWN),
  upload.single('image'),
  handleUploadError,
  updateProfilePictureController,
);
router.delete(
  '/me',
  requirePermission(Permission.USER_DELETE),
  selfDeleteUserController,
);

// Admin routes - require specific permissions
router.get(
  '/admin/customers',
  requirePermission(Permission.USER_VIEW),
  getCustomersController,
);
router.get(
  '/admin/staffs',
  requireAnyPermission([Permission.STAFF_VIEW, Permission.USER_VIEW]),
  getStaffsController,
);
router.delete(
  '/admin/delete/user/:id',
  requirePermission(Permission.USER_DELETE),
  softDeleteUserController,
);
router.patch(
  '/admin/user/:id/role',
  requirePermission(Permission.PERMISSION_ASSIGN),
  updateUserRoleController,
);

export default router;
