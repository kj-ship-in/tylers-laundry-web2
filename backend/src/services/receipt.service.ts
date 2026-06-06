/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { Invoice } from '../models/invoice.model';
import { InvoiceStatus } from '../types/enums';
import { Booking } from '../models/booking.model';
import { Receipt } from '../models/receipt.model';
import { ReceiptRequest } from '../types/receipt';
import ExcelReportGenerator from '../utils/excel-generator';
import PDFGenerator from '../utils/pdf-generator';

const receiptPopulate = [
  {
    path: 'invoiceId',
    populate: {
      path: 'paymentId',
      populate: { path: 'bookingId', populate: [{ path: 'userId' }, { path: 'serviceId' }] },
    },
  },
];

const generateReceiptNumber = async (): Promise<string> => {
  const last = await Receipt.findOne().sort({ createdAt: -1 }).select('receiptNo');
  let nextNumber = 1;
  if (last?.receiptNo) {
    const match = last.receiptNo.match(/RCP-(\d+)/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }
  return `RCP-${nextNumber.toString().padStart(4, '0')}`;
};

export const createReceipt = async (data: ReceiptRequest) => {
  const receiptNo = data.receiptNo ?? (await generateReceiptNumber());
  const receipt = await Receipt.create({ ...data, receiptNo });
  return Receipt.findById(receipt._id).populate(receiptPopulate as any);
};

export const getAllReceipts = async (options?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
}) => {
  const { page = 1, limit = 10, startDate, endDate, status, search } = options ?? {};
  const skip = (page - 1) * limit;

  const where: any = {};
  if (startDate && endDate) {
    where.issuedAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  if (status) {
    const matchingInvoices = await Invoice.find({ status: status as InvoiceStatus }).select('_id');
    where.invoiceId = { $in: matchingInvoices.map(i => i._id) };
  }

  if (search) {
    where.$or = [
      { receiptNo: { $regex: search, $options: 'i' } },
      { receivedBy: { $regex: search, $options: 'i' } },
    ];
  }

  const [receipts, total] = await Promise.all([
    Receipt.find(where)
      .populate(receiptPopulate as any)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Receipt.countDocuments(where),
  ]);

  return { receipts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getReceiptById = async (id: string) => {
  const receipt = await Receipt.findById(id);
  if (!receipt) return null;

  const invoice = await Invoice.findById(receipt.invoiceId).populate('paymentId');
  if (!(invoice as any)?.paymentId) {
    return { ...receipt.toObject(), invoice: null, payment: null, booking: null, user: null, service: null };
  }

  const payment = (invoice as any).paymentId;
  const booking = await Booking.findById(payment.bookingId).populate('userId').populate('serviceId');

  return {
    ...receipt.toObject(),
    invoice: invoice?.toObject(),
    payment: payment?.toObject ? payment.toObject() : payment,
    booking: booking?.toObject(),
    user: (booking as any)?.userId ?? null,
    service: (booking as any)?.serviceId ?? null,
  };
};

export const updateReceipt = async (id: string, data: any) => {
  return Receipt.findByIdAndUpdate(id, data, { new: true }).populate(receiptPopulate as any);
};

export const deleteReceipt = async (id: string) => {
  return Receipt.findByIdAndDelete(id);
};

export const generateReceiptPDF = async (receiptId: string) => {
  const receipt = await getReceiptById(receiptId);
  if (!receipt) throw new Error('Receipt not found');

  console.log('Receipt data for PDF generation:', {
    receiptId,
    hasInvoice: !!receipt.invoice,
    hasPayment: !!receipt.payment,
    hasBooking: !!receipt.booking,
    hasUser: !!receipt.user,
    hasService: !!receipt.service,
  });

  const pdfBuffer = await PDFGenerator.generateReceiptPDF(receipt as any);
  const filename = `receipt-${(receipt as any).receiptNo}-${Date.now()}.pdf`;
  const filepath = await PDFGenerator.savePDFToFile(pdfBuffer, filename);
  return { pdfBuffer, filepath, filename };
};

export const generateReceiptsReport = async (filters: {
  format: 'pdf' | 'excel';
  startDate?: string;
  endDate?: string;
  status?: string;
}) => {
  const where: any = {};
  if (filters.startDate && filters.endDate) {
    where.issuedAt = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
  }
  if (filters.status) {
    const matchingInvoices = await Invoice.find({ status: filters.status as InvoiceStatus }).select('_id');
    where.invoiceId = { $in: matchingInvoices.map(i => i._id) };
  }

  const receipts = await Receipt.find(where)
    .populate(receiptPopulate as any)
    .sort({ createdAt: -1 });

  const flattenedReceipts = receipts.map((r: any) => ({
    ...r.toObject(),
    payment: r.invoiceId?.paymentId ?? null,
    booking: r.invoiceId?.paymentId?.bookingId ?? null,
    user: r.invoiceId?.paymentId?.bookingId?.userId ?? null,
    service: r.invoiceId?.paymentId?.bookingId?.serviceId ?? null,
  }));

  if (filters.format === 'excel') {
    const excelBuffer = await ExcelReportGenerator.generateReceiptsReport(flattenedReceipts, filters);
    const filename = `receipts-report-${Date.now()}.xlsx`;
    const filepath = await ExcelReportGenerator.saveExcelToFile(excelBuffer, filename);
    return { buffer: excelBuffer, filepath, filename, format: 'excel' };
  }

  if (filters.format === 'pdf') {
    const pdfBuffer = await PDFGenerator.generateReceiptsReportPDF(flattenedReceipts, filters);
    const filename = `receipts-report-${Date.now()}.pdf`;
    const filepath = await PDFGenerator.savePDFToFile(pdfBuffer, filename);
    return { buffer: pdfBuffer, filepath, filename, format: 'pdf' };
  }

  return { data: receipts, format: 'json' };
};

export const getReceiptStats = async () => {
  const [totalReceipts, thisMonth, lastMonth] = await Promise.all([
    Receipt.countDocuments(),
    Receipt.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
    Receipt.countDocuments({
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
