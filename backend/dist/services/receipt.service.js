"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReceiptStats = exports.generateReceiptsReport = exports.generateReceiptPDF = exports.deleteReceipt = exports.updateReceipt = exports.getReceiptById = exports.getAllReceipts = exports.createReceipt = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
const invoice_model_1 = require("../models/invoice.model");
const booking_model_1 = require("../models/booking.model");
const receipt_model_1 = require("../models/receipt.model");
const excel_generator_1 = __importDefault(require("../utils/excel-generator"));
const pdf_generator_1 = __importDefault(require("../utils/pdf-generator"));
const receiptPopulate = [
    {
        path: 'invoiceId',
        populate: {
            path: 'paymentId',
            populate: { path: 'bookingId', populate: [{ path: 'userId' }, { path: 'serviceId' }] },
        },
    },
];
const generateReceiptNumber = async () => {
    const last = await receipt_model_1.Receipt.findOne().sort({ createdAt: -1 }).select('receiptNo');
    let nextNumber = 1;
    if (last?.receiptNo) {
        const match = last.receiptNo.match(/RCP-(\d+)/);
        if (match)
            nextNumber = parseInt(match[1], 10) + 1;
    }
    return `RCP-${nextNumber.toString().padStart(4, '0')}`;
};
const createReceipt = async (data) => {
    const receiptNo = data.receiptNo ?? (await generateReceiptNumber());
    const receipt = await receipt_model_1.Receipt.create({ ...data, receiptNo });
    return receipt_model_1.Receipt.findById(receipt._id).populate(receiptPopulate);
};
exports.createReceipt = createReceipt;
const getAllReceipts = async (options) => {
    const { page = 1, limit = 10, startDate, endDate, status, search } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {};
    if (startDate && endDate) {
        where.issuedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (status) {
        const matchingInvoices = await invoice_model_1.Invoice.find({ status: status }).select('_id');
        where.invoiceId = { $in: matchingInvoices.map(i => i._id) };
    }
    if (search) {
        where.$or = [
            { receiptNo: { $regex: search, $options: 'i' } },
            { receivedBy: { $regex: search, $options: 'i' } },
        ];
    }
    const [receipts, total] = await Promise.all([
        receipt_model_1.Receipt.find(where)
            .populate(receiptPopulate)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        receipt_model_1.Receipt.countDocuments(where),
    ]);
    return { receipts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
exports.getAllReceipts = getAllReceipts;
const getReceiptById = async (id) => {
    const receipt = await receipt_model_1.Receipt.findById(id);
    if (!receipt)
        return null;
    const invoice = await invoice_model_1.Invoice.findById(receipt.invoiceId).populate('paymentId');
    if (!invoice?.paymentId) {
        return { ...receipt.toObject(), invoice: null, payment: null, booking: null, user: null, service: null };
    }
    const payment = invoice.paymentId;
    const booking = await booking_model_1.Booking.findById(payment.bookingId).populate('userId').populate('serviceId');
    return {
        ...receipt.toObject(),
        invoice: invoice?.toObject(),
        payment: payment?.toObject ? payment.toObject() : payment,
        booking: booking?.toObject(),
        user: booking?.userId ?? null,
        service: booking?.serviceId ?? null,
    };
};
exports.getReceiptById = getReceiptById;
const updateReceipt = async (id, data) => {
    return receipt_model_1.Receipt.findByIdAndUpdate(id, data, { new: true }).populate(receiptPopulate);
};
exports.updateReceipt = updateReceipt;
const deleteReceipt = async (id) => {
    return receipt_model_1.Receipt.findByIdAndDelete(id);
};
exports.deleteReceipt = deleteReceipt;
const generateReceiptPDF = async (receiptId) => {
    const receipt = await (0, exports.getReceiptById)(receiptId);
    if (!receipt)
        throw new Error('Receipt not found');
    console.log('Receipt data for PDF generation:', {
        receiptId,
        hasInvoice: !!receipt.invoice,
        hasPayment: !!receipt.payment,
        hasBooking: !!receipt.booking,
        hasUser: !!receipt.user,
        hasService: !!receipt.service,
    });
    const pdfBuffer = await pdf_generator_1.default.generateReceiptPDF(receipt);
    const filename = `receipt-${receipt.receiptNo}-${Date.now()}.pdf`;
    const filepath = await pdf_generator_1.default.savePDFToFile(pdfBuffer, filename);
    return { pdfBuffer, filepath, filename };
};
exports.generateReceiptPDF = generateReceiptPDF;
const generateReceiptsReport = async (filters) => {
    const where = {};
    if (filters.startDate && filters.endDate) {
        where.issuedAt = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
    }
    if (filters.status) {
        const matchingInvoices = await invoice_model_1.Invoice.find({ status: filters.status }).select('_id');
        where.invoiceId = { $in: matchingInvoices.map(i => i._id) };
    }
    const receipts = await receipt_model_1.Receipt.find(where)
        .populate(receiptPopulate)
        .sort({ createdAt: -1 });
    // toJSON() applies transforms recursively across all nested models:
    // invoiceId→invoice, paymentId→payment, bookingId→booking, serviceId→service, userId→user
    const flattenedReceipts = receipts.map((r) => {
        const plain = r.toJSON();
        return {
            ...plain,
            payment: plain.invoice?.payment ?? null,
            booking: plain.invoice?.payment?.booking ?? null,
            user: plain.invoice?.payment?.booking?.user ?? null,
            service: plain.invoice?.payment?.booking?.service ?? null,
        };
    });
    if (filters.format === 'excel') {
        const excelBuffer = await excel_generator_1.default.generateReceiptsReport(flattenedReceipts, filters);
        const filename = `receipts-report-${Date.now()}.xlsx`;
        const filepath = await excel_generator_1.default.saveExcelToFile(excelBuffer, filename);
        return { buffer: excelBuffer, filepath, filename, format: 'excel' };
    }
    if (filters.format === 'pdf') {
        const pdfBuffer = await pdf_generator_1.default.generateReceiptsReportPDF(flattenedReceipts, filters);
        const filename = `receipts-report-${Date.now()}.pdf`;
        const filepath = await pdf_generator_1.default.savePDFToFile(pdfBuffer, filename);
        return { buffer: pdfBuffer, filepath, filename, format: 'pdf' };
    }
    return { data: receipts, format: 'json' };
};
exports.generateReceiptsReport = generateReceiptsReport;
const getReceiptStats = async () => {
    const [totalReceipts, thisMonth, lastMonth] = await Promise.all([
        receipt_model_1.Receipt.countDocuments(),
        receipt_model_1.Receipt.countDocuments({
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        }),
        receipt_model_1.Receipt.countDocuments({
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                $lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
            },
        }),
    ]);
    return {
        totalReceipts,
        totalValue: 0,
        thisMonth,
        lastMonth,
        growth: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0,
    };
};
exports.getReceiptStats = getReceiptStats;
