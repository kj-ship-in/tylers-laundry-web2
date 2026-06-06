"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const enums_1 = require("../types/enums");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
// Dashboard and analytics routes
router.get('/dashboard', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), admin_controller_1.getDashboardDataController);
router.get('/reports/bookings', (0, permission_middleware_1.requirePermission)(enums_1.Permission.REPORTS_VIEW), admin_controller_1.getBookingReportsController);
// User management routes
router.delete('/staff/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.STAFF_DELETE), admin_controller_1.deleteStaffController);
router.delete('/customers/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.USER_DELETE), admin_controller_1.deleteCustomerController);
router.patch('/users/:id/status', (0, permission_middleware_1.requirePermission)(enums_1.Permission.USER_UPDATE), admin_controller_1.updateUserStatusController);
router.get('/permissions', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PERMISSION_ASSIGN), admin_controller_1.getAllPermissionsController);
exports.default = router;
