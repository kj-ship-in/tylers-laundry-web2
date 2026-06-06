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
exports.getReceiptStatsController = exports.generateReceiptsReportController = exports.generateReceiptPDFController = exports.deleteReceiptController = exports.updateReceiptController = exports.getReceiptByIdController = exports.getAllReceiptsController = exports.createReceiptController = void 0;
const receiptService = __importStar(require("../services/receipt.service"));
const receipt_schema_1 = require("../validators/receipt.schema");
const createReceiptController = async (req, res, next) => {
    try {
        const parsedRequest = receipt_schema_1.createReceiptSchema.safeParse(req.body);
        if (!parsedRequest.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: parsedRequest.error.issues,
            });
        }
        const receipt = await receiptService.createReceipt(parsedRequest.data);
        res.status(201).json({
            data: receipt,
            message: 'Receipt created successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createReceiptController = createReceiptController;
const getAllReceiptsController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const status = req.query.status;
        const search = req.query.search;
        const result = await receiptService.getAllReceipts({
            page,
            limit,
            startDate,
            endDate,
            status,
            search,
        });
        res.status(200).json({
            message: 'Receipts retrieved successfully',
            data: result.receipts,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllReceiptsController = getAllReceiptsController;
const getReceiptByIdController = async (req, res, next) => {
    try {
        const parsedId = receipt_schema_1.receiptSchema.safeParse({
            receiptId: req.params.id,
        });
        if (!parsedId.success) {
            return res.status(400).json({
                message: 'Invalid receipt ID',
                errors: parsedId.error.issues,
            });
        }
        const receipt = await receiptService.getReceiptById(parsedId.data.receiptId);
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        res.status(200).json({
            data: receipt,
            message: 'Receipt retrieved successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReceiptByIdController = getReceiptByIdController;
const updateReceiptController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const parsed = receipt_schema_1.updateReceiptSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: parsed.error.issues,
            });
        }
        const updated = await receiptService.updateReceipt(id, parsed.data);
        res.status(200).json({
            data: updated,
            message: 'Receipt updated successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateReceiptController = updateReceiptController;
const deleteReceiptController = async (req, res, next) => {
    try {
        const id = req.params.id;
        await receiptService.deleteReceipt(id);
        res.status(200).json({ message: 'Receipt deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReceiptController = deleteReceiptController;
const generateReceiptPDFController = async (req, res, next) => {
    try {
        const receiptId = req.params.id;
        const result = await receiptService.generateReceiptPDF(receiptId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.pdfBuffer);
    }
    catch (error) {
        if (error.message === 'Receipt not found') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};
exports.generateReceiptPDFController = generateReceiptPDFController;
const generateReceiptsReportController = async (req, res, next) => {
    try {
        const format = req.query.format || 'excel';
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const status = req.query.status;
        console.log('🔍 Controller received query params:', {
            format,
            startDate,
            endDate,
            status,
            allQuery: req.query,
        });
        const result = await receiptService.generateReceiptsReport({
            format,
            startDate,
            endDate,
            status,
        });
        if (result.format === 'excel') {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.buffer);
        }
        else if (result.format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.buffer);
        }
        else {
            res.status(200).json({
                message: 'Receipts report generated successfully',
                data: result.data,
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.generateReceiptsReportController = generateReceiptsReportController;
const getReceiptStatsController = async (_, res, next) => {
    try {
        const stats = await receiptService.getReceiptStats();
        res.status(200).json({
            message: 'Receipt statistics retrieved successfully',
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReceiptStatsController = getReceiptStatsController;
