import express from 'express';
import { createReceiptController, getAllReceiptsController, getReceiptByIdController, updateReceiptController, deleteReceiptController, generateReceiptPDFController, generateReceiptsReportController, getReceiptStatsController, } from '../controllers/receipt.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../prisma/generated/prisma';
const router = express.Router();
router.use(authMiddleware);
// CRUD operations
router.post('/create', requirePermission(Permission.RECEIPT_GENERATE), createReceiptController);
router.get('/getAll', requirePermission(Permission.RECEIPT_VIEW_ALL), getAllReceiptsController);
router.get('/get/:id', requirePermission(Permission.RECEIPT_VIEW_ALL), getReceiptByIdController);
router.put('/update/:id', requirePermission(Permission.RECEIPT_UPDATE), updateReceiptController);
router.delete('/delete/:id', requirePermission(Permission.RECEIPT_DELETE), deleteReceiptController);
// PDF generation
router.get('/pdf/:id', requirePermission(Permission.PDF_GENERATE_RECEIPT), generateReceiptPDFController);
// Reports and analytics
router.get('/report', requirePermission(Permission.REPORTS_GENERATE), generateReceiptsReportController);
router.get('/stats', requirePermission(Permission.ANALYTICS_VIEW), getReceiptStatsController);
export default router;
