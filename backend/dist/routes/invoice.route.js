import express from 'express';
import { createInvoiceController, getAllInvoicesController, getInvoiceByIdController, updateInvoiceController, deleteInvoiceController, markInvoiceAsPaidController, generateInvoicePDFController, generateInvoicesReportController, getInvoiceStatsController, getOverdueInvoicesController, } from '../controllers/invoice.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../types/enums';
const router = express.Router();
router.use(authMiddleware);
// CRUD operations
router.post('/create', requirePermission(Permission.INVOICE_GENERATE), createInvoiceController);
router.get('/getAll', requirePermission(Permission.INVOICE_VIEW_ALL), getAllInvoicesController);
router.get('/get/:id', requirePermission(Permission.INVOICE_VIEW_ALL), getInvoiceByIdController);
router.put('/update/:id', requirePermission(Permission.INVOICE_UPDATE), updateInvoiceController);
router.delete('/delete/:id', requirePermission(Permission.INVOICE_DELETE), deleteInvoiceController);
// Status management
router.patch('/mark-paid/:id', requirePermission(Permission.PAYMENT_PROCESS), markInvoiceAsPaidController);
// PDF generation
router.get('/pdf/:id', requirePermission(Permission.PDF_GENERATE_INVOICE), generateInvoicePDFController);
// Reports and analytics
router.get('/report', requirePermission(Permission.REPORTS_GENERATE), generateInvoicesReportController);
router.get('/stats', requirePermission(Permission.ANALYTICS_VIEW), getInvoiceStatsController);
router.get('/overdue', requirePermission(Permission.INVOICE_VIEW_ALL), getOverdueInvoicesController);
export default router;
