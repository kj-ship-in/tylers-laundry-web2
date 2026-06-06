import express from 'express';

import {
  createPaymentController,
  getAllPaymentsController,
  getPaymentByIdController,
  updatePaymentController,
  deletePaymentController,
  refundPaymentController,
  markAsPaidController,
  updatePaymentStatusController,
} from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permission.middleware';
import { Permission } from '../types/enums';

const router = express.Router();

router.use(authMiddleware);

// Payment management routes - require specific permissions
router.post(
  '/create',
  requirePermission(Permission.PAYMENT_CREATE),
  createPaymentController,
);
router.get(
  '/getAll',
  requirePermission(Permission.PAYMENT_VIEW_ALL),
  getAllPaymentsController,
);
router.get(
  '/get/:id',
  requirePermission(Permission.PAYMENT_VIEW_ALL),
  getPaymentByIdController,
);
router.put(
  '/update/:id',
  requirePermission(Permission.PAYMENT_UPDATE),
  updatePaymentController,
);
router.delete(
  '/delete/:id',
  requirePermission(Permission.PAYMENT_DELETE),
  deletePaymentController,
);
router.post(
  '/refund/:id',
  requirePermission(Permission.PAYMENT_PROCESS),
  refundPaymentController,
);
router.post(
  '/mark-paid/:id',
  requirePermission(Permission.PAYMENT_PROCESS),
  markAsPaidController,
);
router.patch(
  '/status/:id',
  requirePermission(Permission.PAYMENT_UPDATE),
  updatePaymentStatusController,
);

export default router;
