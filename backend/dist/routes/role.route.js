"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_controller_1 = require("../controllers/role.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const enums_1 = require("../types/enums");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_middleware_1.authMiddleware);
// Role management routes (Admin only)
router.post('/create', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ROLE_CREATE), role_controller_1.createRoleController);
router.get('/getAll', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ROLE_VIEW), role_controller_1.getAllRolesController);
router.get('/getById/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ROLE_VIEW), role_controller_1.getRoleByIdController);
router.put('/update/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ROLE_UPDATE), role_controller_1.updateRoleController);
router.delete('/delete/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ROLE_DELETE), role_controller_1.deleteRoleController);
// Permission assignment routes
router.put('/assign/:id/permissions', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PERMISSION_ASSIGN), role_controller_1.assignPermissionsToRoleController);
// Get all available permissions
router.get('/permissions/all', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ROLE_VIEW), role_controller_1.getAllPermissionsController);
// User role and permission management
router.put('/users/assign', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PERMISSION_ASSIGN), role_controller_1.assignRoleToUserController);
router.put('/users/:userId/permissions/reset', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PERMISSION_ASSIGN), role_controller_1.resetUserPermissionsController);
router.put('/users/:userId/permissions/add', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PERMISSION_ASSIGN), role_controller_1.addUserPermissionsController);
router.put('/users/:userId/permissions/remove', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PERMISSION_ASSIGN), role_controller_1.removeUserPermissionsController);
exports.default = router;
