import { Request, Response, NextFunction } from 'express';

import * as paymentService from '../services/payment.service';
import {
  createPaymentSchema,
  updatePaymentSchema,
  updatePaymentStatusSchema,
} from '../validators/payment.schema';

export const createPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const parsedRequest = createPaymentSchema.safeParse(req.body);

    if (!parsedRequest.success) {
      return res.status(400).json({
        message: parsedRequest.error,
      });
    }
    const payment = await paymentService.createPayment(parsedRequest.data);
    res.status(201).json({
      data: payment,
      message: 'Payment created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPaymentsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) ?? 1;
    const limit = parseInt(req.query.limit as string) ?? 10;
    const status = req.query.status as string;
    const method = req.query.method as string;

    if (limit > 100) {
      return res.status(400).json({
        message: 'Limit cannot exceed 100 payments per page',
      });
    }

    const result = await paymentService.getAllPayments({
      page,
      limit,
      status,
      method,
    });

    return res.status(200).json({
      data: result.payments,
      pagination: {
        page: result.pagination.currentPage,
        limit,
        total: result.pagination.totalPayments,
        totalPages: result.pagination.totalPages,
        hasNext: result.pagination.hasNext,
        hasPrev: result.pagination.hasPrev,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const id = req.params.id;
    const payment = await paymentService.getPaymentById(id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.status(200).json(payment);
  } catch (error) {
    next(error);
  }
};

export const updatePaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const id = req.params.id;

    const parsed = updatePaymentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error,
      });
    }
    const updated = await paymentService.updatePayment(id, parsed.data);
    res.json({ data: updated, message: 'Payment updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deletePaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    await paymentService.deletePayment(id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const refundPaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const id = req.params.id;
    const { reason } = req.body;

    const refundedPayment = await paymentService.refundPayment(id, reason);
    res.json({
      data: refundedPayment,
      message: 'Payment refunded successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const markAsPaidController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const id = req.params.id;

    const paidPayment = await paymentService.markAsPaid(id);
    res.json({
      data: paidPayment,
      message: 'Payment marked as paid successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const id = req.params.id;

    const parsed = updatePaymentStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error,
      });
    }

    const updated = await paymentService.updatePaymentStatus(
      id,
      parsed.data.status,
    );
    res.json({
      data: updated,
      message: 'Payment status updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
