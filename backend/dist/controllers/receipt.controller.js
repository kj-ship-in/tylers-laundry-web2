import * as receiptService from '../services/receipt.service';
import { createReceiptSchema, receiptSchema, updateReceiptSchema, } from '../validators/receipt.schema';
export const createReceiptController = async (req, res, next) => {
    try {
        const parsedRequest = createReceiptSchema.safeParse(req.body);
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
export const getAllReceiptsController = async (req, res, next) => {
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
export const getReceiptByIdController = async (req, res, next) => {
    try {
        const parsedId = receiptSchema.safeParse({
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
export const updateReceiptController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const parsed = updateReceiptSchema.safeParse(req.body);
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
export const deleteReceiptController = async (req, res, next) => {
    try {
        const id = req.params.id;
        await receiptService.deleteReceipt(id);
        res.status(200).json({ message: 'Receipt deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const generateReceiptPDFController = async (req, res, next) => {
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
export const generateReceiptsReportController = async (req, res, next) => {
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
export const getReceiptStatsController = async (_, res, next) => {
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
