"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markInvoiceAsPaid = exports.getInvoiceStats = exports.getOverdueInvoices = exports.generateInvoicesReport = exports.generateInvoicePDF = exports.deleteInvoice = exports.updateInvoice = exports.getInvoiceById = exports.getAllInvoices = exports.createInvoice = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const invoice_model_1 = require("../models/invoice.model");
const payment_model_1 = require("../models/payment.model");
const enums_1 = require("../types/enums");
const excel_generator_1 = __importDefault(require("../utils/excel-generator"));
const pdf_generator_1 = __importDefault(require("../utils/pdf-generator"));
const invoicePopulate = [
    {
        path: 'paymentId',
        populate: { path: 'bookingId', populate: [{ path: 'userId' }, { path: 'serviceId' }] },
    },
    'receipt',
];
const generateInvoiceNumber = async () => {
    const last = await invoice_model_1.Invoice.findOne().sort({ createdAt: -1 }).select('invoiceNo');
    let nextNumber = 1;
    if (last?.invoiceNo) {
        const match = last.invoiceNo.match(/INV-(\d+)/);
        if (match)
            nextNumber = parseInt(match[1], 10) + 1;
    }
    return `INV-${nextNumber.toString().padStart(4, '0')}`;
};
const createInvoice = async (data) => {
    const invoiceNo = await generateInvoiceNumber();
    const invoice = await invoice_model_1.Invoice.create({ ...data, invoiceNo });
    return invoice_model_1.Invoice.findById(invoice._id).populate(invoicePopulate);
};
exports.createInvoice = createInvoice;
const getAllInvoices = async (options) => {
    const { page = 1, limit = 10, status, startDate, endDate, search } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {};
    if (status)
        where.status = status;
    if (startDate && endDate) {
        where.issuedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (search) {
        const matchingPayments = await payment_model_1.Payment.aggregate([
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking',
                },
            },
            { $unwind: '$booking' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'booking.userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $match: {
                    $or: [
                        { 'user.name': { $regex: search, $options: 'i' } },
                        { 'user.email': { $regex: search, $options: 'i' } },
                    ],
                },
            },
            { $project: { _id: 1 } },
        ]);
        const paymentIds = matchingPayments.map((p) => p._id);
        where.$or = [
            { invoiceNo: { $regex: search, $options: 'i' } },
            { paymentId: { $in: paymentIds } },
        ];
    }
    const [invoices, total] = await Promise.all([
        invoice_model_1.Invoice.find(where)
            .populate(invoicePopulate)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        invoice_model_1.Invoice.countDocuments(where),
    ]);
    return {
        invoices,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
};
exports.getAllInvoices = getAllInvoices;
const getInvoiceById = async (id) => {
    return invoice_model_1.Invoice.findById(id).populate(invoicePopulate);
};
exports.getInvoiceById = getInvoiceById;
const updateInvoice = async (id, data) => {
    return invoice_model_1.Invoice.findByIdAndUpdate(id, data, { new: true }).populate(invoicePopulate);
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (id) => {
    return invoice_model_1.Invoice.findByIdAndDelete(id);
};
exports.deleteInvoice = deleteInvoice;
const generateInvoicePDF = async (invoiceId) => {
    const invoice = await (0, exports.getInvoiceById)(invoiceId);
    if (!invoice)
        throw new Error('Invoice not found');
    const invoiceData = {
        invoice,
        payment: invoice.paymentId,
        booking: invoice.paymentId?.bookingId,
        user: invoice.paymentId?.bookingId?.userId,
        service: invoice.paymentId?.bookingId?.serviceId,
    };
    const pdfBuffer = await pdf_generator_1.default.generateInvoicePDF(invoiceData);
    const filename = `invoice-${invoice.invoiceNo}-${Date.now()}.pdf`;
    const filepath = await pdf_generator_1.default.savePDFToFile(pdfBuffer, filename);
    return { pdfBuffer, filepath, filename };
};
exports.generateInvoicePDF = generateInvoicePDF;
const generateInvoicesReport = async (filters) => {
    const where = {};
    if (filters.status)
        where.status = filters.status;
    if (filters.startDate && filters.endDate) {
        where.issuedAt = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
    }
    const invoices = await invoice_model_1.Invoice.find(where)
        .populate(invoicePopulate)
        .sort({ createdAt: -1 });
    // Convert to plain objects so toJSON transforms run recursively:
    // paymentId→payment, bookingId→booking, userId→user, serviceId→service
    const plainInvoices = invoices.map(i => i.toJSON());
    if (filters.format === 'excel') {
        const excelBuffer = await excel_generator_1.default.generateInvoicesReport(plainInvoices, filters);
        const filename = `invoices-report-${Date.now()}.xlsx`;
        const filepath = await excel_generator_1.default.saveExcelToFile(excelBuffer, filename);
        return { buffer: excelBuffer, filepath, filename, format: 'excel' };
    }
    if (filters.format === 'pdf') {
        const pdfBuffer = await pdf_generator_1.default.generateInvoicesReportPDF(plainInvoices, filters);
        const filename = `invoices-report-${Date.now()}.pdf`;
        const filepath = await pdf_generator_1.default.savePDFToFile(pdfBuffer, filename);
        return { buffer: pdfBuffer, filepath, filename, format: 'pdf' };
    }
    return { data: plainInvoices, format: 'json' };
};
exports.generateInvoicesReport = generateInvoicesReport;
const getOverdueInvoices = async (options) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const where = { status: enums_1.InvoiceStatus.UNPAID, dueDate: { $lt: new Date() } };
    const [invoices, total] = await Promise.all([
        invoice_model_1.Invoice.find(where)
            .populate(invoicePopulate)
            .sort({ dueDate: 1 })
            .skip(skip)
            .limit(limit),
        invoice_model_1.Invoice.countDocuments(where),
    ]);
    return { invoices, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};
exports.getOverdueInvoices = getOverdueInvoices;
const getInvoiceStats = async () => {
    const [totalInvoices, paidInvoices, unpaidInvoices, overdueInvoices, revenueResults] = await Promise.all([
        invoice_model_1.Invoice.countDocuments(),
        invoice_model_1.Invoice.countDocuments({ status: enums_1.InvoiceStatus.PAID }),
        invoice_model_1.Invoice.countDocuments({ status: enums_1.InvoiceStatus.UNPAID }),
        invoice_model_1.Invoice.countDocuments({ status: enums_1.InvoiceStatus.UNPAID, dueDate: { $lt: new Date() } }),
        invoice_model_1.Invoice.aggregate([
            {
                $group: {
                    _id: '$status',
                    total: { $sum: '$totalAmount' },
                },
            },
        ]),
    ]);
    const totalRevenue = revenueResults.find((r) => r._id === 'PAID')?.total ?? 0;
    const unpaidAmount = revenueResults.find((r) => r._id === 'UNPAID')?.total ?? 0;
    const twelveMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1);
    const monthlyRevenueRaw = await invoice_model_1.Invoice.aggregate([
        { $match: { status: 'PAID', issuedAt: { $gte: twelveMonthsAgo } } },
        {
            $group: {
                _id: { year: { $year: '$issuedAt' }, month: { $month: '$issuedAt' } },
                totalAmount: { $sum: '$totalAmount' },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = monthlyRevenueRaw.map((m) => ({
        month: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
        revenue: m.totalAmount,
        count: m.count,
    }));
    return { totalInvoices, paidInvoices, unpaidInvoices, overdueInvoices, totalRevenue, unpaidAmount, monthlyRevenue };
};
exports.getInvoiceStats = getInvoiceStats;
const markInvoiceAsPaid = async (invoiceId) => {
    return invoice_model_1.Invoice.findByIdAndUpdate(invoiceId, { status: 'PAID' }, { new: true }).populate(invoicePopulate);
};
exports.markInvoiceAsPaid = markInvoiceAsPaid;
