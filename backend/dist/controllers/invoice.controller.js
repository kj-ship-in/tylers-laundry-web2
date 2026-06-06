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
exports.getOverdueInvoicesController = exports.getInvoiceStatsController = exports.generateInvoicesReportController = exports.generateInvoicePDFController = exports.markInvoiceAsPaidController = exports.deleteInvoiceController = exports.updateInvoiceController = exports.getInvoiceByIdController = exports.getAllInvoicesController = exports.createInvoiceController = void 0;
const invoiceService = __importStar(require("../services/invoice.service"));
const invoice_schema_1 = require("../validators/invoice.schema");
const createInvoiceController = async (req, res, next) => {
    try {
        const parsedRequest = invoice_schema_1.createInvoiceSchema.safeParse(req.body);
        if (!parsedRequest.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: parsedRequest.error.issues,
            });
        }
        const invoice = await invoiceService.createInvoice(parsedRequest.data);
        res.status(201).json({
            data: invoice,
            message: 'Invoice created successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createInvoiceController = createInvoiceController;
const getAllInvoicesController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const status = req.query.status;
        const search = req.query.search;
        const result = await invoiceService.getAllInvoices({
            page,
            limit,
            startDate,
            endDate,
            status,
            search,
        });
        res.status(200).json({
            message: 'Invoices retrieved successfully',
            data: result.invoices,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllInvoicesController = getAllInvoicesController;
const getInvoiceByIdController = async (req, res, next) => {
    try {
        const parsedId = invoice_schema_1.invoiceSchema.safeParse({
            invoiceId: req.params.id,
        });
        if (!parsedId.success) {
            return res.status(400).json({
                message: 'Invalid invoice ID',
                errors: parsedId.error.issues,
            });
        }
        const invoice = await invoiceService.getInvoiceById(parsedId.data.invoiceId);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }
        res.status(200).json({
            data: invoice,
            message: 'Invoice retrieved successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoiceByIdController = getInvoiceByIdController;
const updateInvoiceController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const parsed = invoice_schema_1.updateInvoiceSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: parsed.error.issues,
            });
        }
        const updated = await invoiceService.updateInvoice(id, parsed.data);
        res.status(200).json({
            data: updated,
            message: 'Invoice updated successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateInvoiceController = updateInvoiceController;
const deleteInvoiceController = async (req, res, next) => {
    try {
        const id = req.params.id;
        await invoiceService.deleteInvoice(id);
        res.status(200).json({ message: 'Invoice deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteInvoiceController = deleteInvoiceController;
const markInvoiceAsPaidController = async (req, res, next) => {
    try {
        const invoiceId = req.params.id;
        const invoice = await invoiceService.markInvoiceAsPaid(invoiceId);
        res.status(200).json({
            message: 'Invoice marked as paid successfully',
            data: invoice,
        });
    }
    catch (error) {
        if (error.message === 'Invoice not found') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};
exports.markInvoiceAsPaidController = markInvoiceAsPaidController;
const generateInvoicePDFController = async (req, res, next) => {
    try {
        const invoiceId = req.params.id;
        const result = await invoiceService.generateInvoicePDF(invoiceId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
        res.send(result.pdfBuffer);
    }
    catch (error) {
        if (error.message === 'Invoice not found') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};
exports.generateInvoicePDFController = generateInvoicePDFController;
const generateInvoicesReportController = async (req, res, next) => {
    try {
        const format = req.query.format || 'excel';
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const status = req.query.status;
        const result = await invoiceService.generateInvoicesReport({
            format,
            startDate,
            endDate,
            status,
        });
        if (result.format === 'excel') {
            // Set headers for Excel download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            // Send the buffer
            res.send(result.buffer);
        }
        else {
            // For PDF or other formats
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.send(result.buffer);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.generateInvoicesReportController = generateInvoicesReportController;
const getInvoiceStatsController = async (_, res, next) => {
    try {
        const stats = await invoiceService.getInvoiceStats();
        res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
};
exports.getInvoiceStatsController = getInvoiceStatsController;
const getOverdueInvoicesController = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await invoiceService.getOverdueInvoices({ page, limit });
        res.status(200).json({
            message: 'Overdue invoices retrieved successfully',
            data: result.invoices,
            pagination: result.pagination,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOverdueInvoicesController = getOverdueInvoicesController;
