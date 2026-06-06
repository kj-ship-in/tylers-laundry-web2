/* eslint-disable @typescript-eslint/no-explicit-any */
import { Invoice } from '../models/invoice.model';
import { Payment } from '../models/payment.model';
import { InvoiceStatus } from '../types/enums';
import ExcelReportGenerator from '../utils/excel-generator';
import PDFGenerator from '../utils/pdf-generator';
const invoicePopulate = [
    {
        path: 'paymentId',
        populate: { path: 'bookingId', populate: [{ path: 'userId' }, { path: 'serviceId' }] },
    },
    'receipt',
];
const generateInvoiceNumber = async () => {
    const last = await Invoice.findOne().sort({ createdAt: -1 }).select('invoiceNo');
    let nextNumber = 1;
    if (last?.invoiceNo) {
        const match = last.invoiceNo.match(/INV-(\d+)/);
        if (match)
            nextNumber = parseInt(match[1], 10) + 1;
    }
    return `INV-${nextNumber.toString().padStart(4, '0')}`;
};
export const createInvoice = async (data) => {
    const invoiceNo = await generateInvoiceNumber();
    const invoice = await Invoice.create({ ...data, invoiceNo });
    return Invoice.findById(invoice._id).populate(invoicePopulate);
};
export const getAllInvoices = async (options) => {
    const { page = 1, limit = 10, status, startDate, endDate, search } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {};
    if (status)
        where.status = status;
    if (startDate && endDate) {
        where.issuedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (search) {
        const matchingPayments = await Payment.aggregate([
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
        Invoice.find(where)
            .populate(invoicePopulate)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Invoice.countDocuments(where),
    ]);
    return {
        invoices,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
};
export const getInvoiceById = async (id) => {
    return Invoice.findById(id).populate(invoicePopulate);
};
export const updateInvoice = async (id, data) => {
    return Invoice.findByIdAndUpdate(id, data, { new: true }).populate(invoicePopulate);
};
export const deleteInvoice = async (id) => {
    return Invoice.findByIdAndDelete(id);
};
export const generateInvoicePDF = async (invoiceId) => {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice)
        throw new Error('Invoice not found');
    const invoiceData = {
        invoice,
        payment: invoice.paymentId,
        booking: invoice.paymentId?.bookingId,
        user: invoice.paymentId?.bookingId?.userId,
        service: invoice.paymentId?.bookingId?.serviceId,
    };
    const pdfBuffer = await PDFGenerator.generateInvoicePDF(invoiceData);
    const filename = `invoice-${invoice.invoiceNo}-${Date.now()}.pdf`;
    const filepath = await PDFGenerator.savePDFToFile(pdfBuffer, filename);
    return { pdfBuffer, filepath, filename };
};
export const generateInvoicesReport = async (filters) => {
    const where = {};
    if (filters.status)
        where.status = filters.status;
    if (filters.startDate && filters.endDate) {
        where.issuedAt = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
    }
    const invoices = await Invoice.find(where)
        .populate(invoicePopulate)
        .sort({ createdAt: -1 });
    // Convert to plain objects so toJSON transforms run recursively:
    // paymentId→payment, bookingId→booking, userId→user, serviceId→service
    const plainInvoices = invoices.map(i => i.toJSON());
    if (filters.format === 'excel') {
        const excelBuffer = await ExcelReportGenerator.generateInvoicesReport(plainInvoices, filters);
        const filename = `invoices-report-${Date.now()}.xlsx`;
        const filepath = await ExcelReportGenerator.saveExcelToFile(excelBuffer, filename);
        return { buffer: excelBuffer, filepath, filename, format: 'excel' };
    }
    if (filters.format === 'pdf') {
        const pdfBuffer = await PDFGenerator.generateInvoicesReportPDF(plainInvoices, filters);
        const filename = `invoices-report-${Date.now()}.pdf`;
        const filepath = await PDFGenerator.savePDFToFile(pdfBuffer, filename);
        return { buffer: pdfBuffer, filepath, filename, format: 'pdf' };
    }
    return { data: plainInvoices, format: 'json' };
};
export const getOverdueInvoices = async (options) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const where = { status: InvoiceStatus.UNPAID, dueDate: { $lt: new Date() } };
    const [invoices, total] = await Promise.all([
        Invoice.find(where)
            .populate(invoicePopulate)
            .sort({ dueDate: 1 })
            .skip(skip)
            .limit(limit),
        Invoice.countDocuments(where),
    ]);
    return { invoices, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};
export const getInvoiceStats = async () => {
    const [totalInvoices, paidInvoices, unpaidInvoices, overdueInvoices, revenueResults] = await Promise.all([
        Invoice.countDocuments(),
        Invoice.countDocuments({ status: InvoiceStatus.PAID }),
        Invoice.countDocuments({ status: InvoiceStatus.UNPAID }),
        Invoice.countDocuments({ status: InvoiceStatus.UNPAID, dueDate: { $lt: new Date() } }),
        Invoice.aggregate([
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
    const monthlyRevenueRaw = await Invoice.aggregate([
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
export const markInvoiceAsPaid = async (invoiceId) => {
    return Invoice.findByIdAndUpdate(invoiceId, { status: 'PAID' }, { new: true }).populate(invoicePopulate);
};
