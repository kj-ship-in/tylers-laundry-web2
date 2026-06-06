"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoice_controller_1 = require("../controllers/invoice.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const enums_1 = require("../types/enums");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
// CRUD operations
router.post('/create', (0, permission_middleware_1.requirePermission)(enums_1.Permission.INVOICE_GENERATE), invoice_controller_1.createInvoiceController);
router.get('/getAll', (0, permission_middleware_1.requirePermission)(enums_1.Permission.INVOICE_VIEW_ALL), invoice_controller_1.getAllInvoicesController);
router.get('/get/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.INVOICE_VIEW_ALL), invoice_controller_1.getInvoiceByIdController);
router.put('/update/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.INVOICE_UPDATE), invoice_controller_1.updateInvoiceController);
router.delete('/delete/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.INVOICE_DELETE), invoice_controller_1.deleteInvoiceController);
// Status management
router.patch('/mark-paid/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PAYMENT_PROCESS), invoice_controller_1.markInvoiceAsPaidController);
// PDF generation
router.get('/pdf/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.PDF_GENERATE_INVOICE), invoice_controller_1.generateInvoicePDFController);
// Reports and analytics
router.get('/report', (0, permission_middleware_1.requirePermission)(enums_1.Permission.REPORTS_GENERATE), invoice_controller_1.generateInvoicesReportController);
router.get('/stats', (0, permission_middleware_1.requirePermission)(enums_1.Permission.ANALYTICS_VIEW), invoice_controller_1.getInvoiceStatsController);
router.get('/overdue', (0, permission_middleware_1.requirePermission)(enums_1.Permission.INVOICE_VIEW_ALL), invoice_controller_1.getOverdueInvoicesController);
exports.default = router;
