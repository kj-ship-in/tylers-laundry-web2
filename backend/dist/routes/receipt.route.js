"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const receipt_controller_1 = require("../controllers/receipt.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const enums_1 = require("../types/enums");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
// CRUD operations
router.post('/create', (0, permission_middleware_1.requirePermission)(enums_1.Permission.RECEIPT_GENERATE), receipt_controller_1.createReceiptController);
router.get('/getAll', (0, permission_middleware_1.requirePermission)(enums_1.Permission.RECEIPT_VIEW_ALL), receipt_controller_1.getAllReceiptsController);
router.get('/get/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.RECEIPT_VIEW_ALL), receipt_controller_1.getReceiptByIdController);
router.put('/update/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.RECEIPT_UPDATE), receipt_controller_1.updateReceiptController);
router.delete('/delete/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.RECEIPT_DELETE), receipt_controller_1.deleteReceiptController);
// PDF generation
router.get('/pdf/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PDF_GENERATE_RECEIPT), receipt_controller_1.generateReceiptPDFController);
// Reports and analytics
router.get('/report', (0, permission_middleware_1.requirePermission)(enums_1.Permission.REPORTS_GENERATE), receipt_controller_1.generateReceiptsReportController);
router.get('/stats', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), receipt_controller_1.getReceiptStatsController);
exports.default = router;
