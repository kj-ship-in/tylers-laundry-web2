"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusController = exports.markAsPaidController = exports.refundPaymentController = exports.deletePaymentController = exports.updatePaymentController = exports.getPaymentByIdController = exports.getAllPaymentsController = exports.createPaymentController = void 0;
const paymentService = __importStar(require("../services/payment.service"));
const payment_schema_1 = require("../validators/payment.schema");
const createPaymentController = async (req, res, next) => {
    try {
        const parsedRequest = payment_schema_1.createPaymentSchema.safeParse(req.body);
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
    }
    catch (error) {
        next(error);
    }
};
exports.createPaymentController = createPaymentController;
const getAllPaymentsController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) ?? 1;
        const limit = parseInt(req.query.limit) ?? 10;
        const status = req.query.status;
        const method = req.query.method;
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPaymentsController = getAllPaymentsController;
const getPaymentByIdController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const payment = await paymentService.getPaymentById(id);
        if (!payment)
            return res.status(404).json({ message: 'Payment not found' });
        res.status(200).json(payment);
    }
    catch (error) {
        next(error);
    }
};
exports.getPaymentByIdController = getPaymentByIdController;
const updatePaymentController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const parsed = payment_schema_1.updatePaymentSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error,
            });
        }
        const updated = await paymentService.updatePayment(id, parsed.data);
        res.json({ data: updated, message: 'Payment updated successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePaymentController = updatePaymentController;
const deletePaymentController = async (req, res, next) => {
    try {
        const id = req.params.id;
        await paymentService.deletePayment(id);
        res.json({ message: 'Payment deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deletePaymentController = deletePaymentController;
const refundPaymentController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { reason } = req.body;
        const refundedPayment = await paymentService.refundPayment(id, reason);
        res.json({
            data: refundedPayment,
            message: 'Payment refunded successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refundPaymentController = refundPaymentController;
const markAsPaidController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const paidPayment = await paymentService.markAsPaid(id);
        res.json({
            data: paidPayment,
            message: 'Payment marked as paid successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsPaidController = markAsPaidController;
const updatePaymentStatusController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const parsed = payment_schema_1.updatePaymentStatusSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error,
            });
        }
        const updated = await paymentService.updatePaymentStatus(id, parsed.data.status);
        res.json({
            data: updated,
            message: 'Payment status updated successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePaymentStatusController = updatePaymentStatusController;
