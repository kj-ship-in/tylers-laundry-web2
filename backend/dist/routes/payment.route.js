"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const enums_1 = require("../types/enums");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
// Payment management routes - require specific permissions
router.post('/create', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PAYMENT_CREATE), payment_controller_1.createPaymentController);
router.get('/getAll', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PAYMENT_VIEW_ALL), payment_controller_1.getAllPaymentsController);
router.get('/get/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PAYMENT_VIEW_ALL), payment_controller_1.getPaymentByIdController);
router.put('/update/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PAYMENT_UPDATE), payment_controller_1.updatePaymentController);
router.delete('/delete/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PAYMENT_DELETE), payment_controller_1.deletePaymentController);
router.post('/refund/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PAYMENT_PROCESS), payment_controller_1.refundPaymentController);
router.post('/mark-paid/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PAYMENT_PROCESS), payment_controller_1.markAsPaidController);
router.patch('/status/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PAYMENT_UPDATE), payment_controller_1.updatePaymentStatusController);
exports.default = router;
