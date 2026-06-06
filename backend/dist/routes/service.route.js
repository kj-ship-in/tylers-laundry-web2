"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service_controller_1 = require("../controllers/service.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const enums_1 = require("../types/enums");
const router = express_1.default.Router();
// Public routes - no authentication required
router.get('/', service_controller_1.getPublicServicesController);
// Authenticated routes - require authentication
router.use(auth_middleware_1.authMiddleware);
// Staff/Admin routes - require specific permissions
router.get('/overview/stats', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), service_controller_1.getServiceOverviewController);
router.get('/getAll', (0, permission_middleware_1.requirePermission)(enums_1.Permission.SERVICE_VIEW), service_controller_1.getAllServicesController);
router.post('/create', (0, permission_middleware_1.requirePermission)(enums_1.Permission.SERVICE_CREATE), service_controller_1.createServiceController);
router.get('/get/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.SERVICE_VIEW), service_controller_1.getServiceByIdController);
router.put('/update/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.SERVICE_UPDATE), service_controller_1.updateServiceController);
router.delete('/delete/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.SERVICE_DELETE), service_controller_1.deleteServiceController);
exports.default = router;
