"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const upload_error_middleware_1 = require("../middlewares/upload-error.middleware");
const enums_1 = require("../types/enums");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
// Profile routes - any authenticated user
router.get('/me', user_controller_1.getCurrentUserController);
router.patch('/profile-details', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PROFILE_UPDATE_OWN), user_controller_1.updateProfileDetailsController);
router.patch('/profile-picture', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PROFILE_UPDATE_OWN), multer_middleware_1.upload.single('image'), upload_error_middleware_1.handleUploadError, user_controller_1.updateProfilePictureController);
router.delete('/me', (0, permission_middleware_1.requirePermission)(enums_1.Permission.USER_DELETE), auth_controller_1.selfDeleteUserController);
// Admin routes - require specific permissions
router.get('/admin/customers', (0, permission_middleware_1.requirePermission)(enums_1.Permission.USER_VIEW), user_controller_1.getCustomersController);
router.get('/admin/staffs', (0, permission_middleware_1.requireAnyPermission)([enums_1.Permission.STAFF_VIEW, enums_1.Permission.USER_VIEW]), user_controller_1.getStaffsController);
router.delete('/admin/delete/user/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.USER_DELETE), auth_controller_1.softDeleteUserController);
router.patch('/admin/user/:id/role', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PERMISSION_ASSIGN), user_controller_1.updateUserRoleController);
exports.default = router;
