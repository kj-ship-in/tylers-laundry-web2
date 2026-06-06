import * as invoiceService from '../services/invoice.service';
import { createInvoiceSchema, invoiceSchema, updateInvoiceSchema, } from '../validators/invoice.schema';
export const createInvoiceController = async (req, res, next) => {
    try {
        const parsedRequest = createInvoiceSchema.safeParse(req.body);
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
export const getAllInvoicesController = async (req, res, next) => {
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
export const getInvoiceByIdController = async (req, res, next) => {
    try {
        const parsedId = invoiceSchema.safeParse({
            invoiceId: parseInt(req.params.id),
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
export const updateInvoiceController = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const parsed = updateInvoiceSchema.safeParse(req.body);
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
export const deleteInvoiceController = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await invoiceService.deleteInvoice(id);
        res.status(200).json({ message: 'Invoice deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const markInvoiceAsPaidController = async (req, res, next) => {
    try {
        const invoiceId = Number(req.params.id);
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
export const generateInvoicePDFController = async (req, res, next) => {
    try {
        const invoiceId = Number(req.params.id);
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
export const generateInvoicesReportController = async (req, res, next) => {
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
export const getInvoiceStatsController = async (_, res, next) => {
    try {
        const stats = await invoiceService.getInvoiceStats();
        res.status(200).json(stats);
    }
    catch (error) {
        next(error);
    }
};
export const getOverdueInvoicesController = async (req, res, next) => {
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
