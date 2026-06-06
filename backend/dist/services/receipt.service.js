/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../lib/prisma';
import ExcelReportGenerator from '../utils/excel-generator';
import PDFGenerator from '../utils/pdf-generator';
const generateReceiptNumber = async () => {
    const lastReceipt = await prisma.receipt.findFirst({
        orderBy: { id: 'desc' },
        select: { receiptNo: true },
    });
    let nextNumber = 1;
    if (lastReceipt?.receiptNo) {
        const match = lastReceipt.receiptNo.match(/RCP-(\d+)/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }
    return `RCP-${nextNumber.toString().padStart(4, '0')}`;
};
export const createReceipt = async (data) => {
    // Always generate receipt number automatically
    const receiptNo = data.receiptNo ?? (await generateReceiptNumber());
    const receiptData = { ...data, receiptNo };
    return prisma.receipt.create({
        data: receiptData,
        include: {
            invoice: {
                include: {
                    payment: {
                        include: {
                            booking: {
                                include: {
                                    user: true,
                                    service: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};
export const getAllReceipts = async (options) => {
    const { page = 1, limit = 10, startDate, endDate, status, search, } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {};
    if (startDate && endDate) {
        where.issuedAt = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }
    if (status) {
        where.invoice = {
            status,
        };
    }
    if (search) {
        where.OR = [
            { receiptNo: { contains: search, mode: 'insensitive' } },
            { receivedBy: { contains: search, mode: 'insensitive' } },
            { invoice: { invoiceNo: { contains: search, mode: 'insensitive' } } },
        ];
    }
    const [receipts, total] = await Promise.all([
        prisma.receipt.findMany({
            where,
            skip,
            take: limit,
            include: {
                invoice: {
                    include: {
                        payment: {
                            include: {
                                booking: {
                                    include: {
                                        user: true,
                                        service: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.receipt.count({ where }),
    ]);
    return {
        receipts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
export const getReceiptById = async (id) => {
    // First get the receipt
    const receipt = await prisma.receipt.findUnique({
        where: { id },
    });
    if (!receipt) {
        return null;
    }
    // Get the invoice with payment
    const invoice = await prisma.invoice.findUnique({
        where: { id: receipt.invoiceId },
        include: {
            payment: true,
        },
    });
    if (!invoice?.payment) {
        return {
            ...receipt,
            invoice: null,
            payment: null,
            booking: null,
            user: null,
            service: null,
        };
    }
    // Get the booking with user and service
    const booking = await prisma.booking.findUnique({
        where: { id: invoice.payment.bookingId },
        include: {
            user: true,
            service: true,
        },
    });
    return {
        ...receipt,
        invoice,
        payment: invoice.payment,
        booking,
        user: booking?.user ?? null,
        service: booking?.service ?? null,
    };
};
export const updateReceipt = async (id, data) => {
    return prisma.receipt.update({
        where: { id },
        data,
        include: {
            invoice: {
                include: {
                    payment: {
                        include: {
                            booking: {
                                include: {
                                    user: true,
                                    service: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
};
export const deleteReceipt = async (id) => {
    return prisma.receipt.delete({ where: { id } });
};
export const generateReceiptPDF = async (receiptId) => {
    const receipt = await getReceiptById(receiptId);
    if (!receipt) {
        throw new Error('Receipt not found');
    }
    // Log receipt data structure for debugging
    console.log('Receipt data for PDF generation:', {
        receiptId,
        hasInvoice: !!receipt.invoice,
        hasPayment: !!receipt.payment,
        hasBooking: !!receipt.booking,
        hasUser: !!receipt.user,
        hasService: !!receipt.service,
    });
    // Log actual data values
    console.log('Receipt data details:', {
        receipt: {
            id: receipt.id,
            receiptNo: receipt.receiptNo,
            issuedAt: receipt.issuedAt,
            receivedBy: receipt.receivedBy,
        },
        invoice: receipt.invoice
            ? {
                id: receipt.invoice.id,
                invoiceNo: receipt.invoice.invoiceNo,
                tax: receipt.invoice.tax,
                discount: receipt.invoice.discount,
            }
            : null,
        payment: receipt.payment
            ? {
                id: receipt.payment.id,
                transactionId: receipt.payment.transactionId,
                amount: receipt.payment.amount,
                method: receipt.payment.method,
                status: receipt.payment.status,
            }
            : null,
        booking: receipt.booking
            ? {
                id: receipt.booking.id,
                date: receipt.booking.date,
                totalAmount: receipt.booking.totalAmount,
                deliveryFee: receipt.booking.deliveryFee,
                status: receipt.booking.status,
            }
            : null,
        user: receipt.user
            ? {
                id: receipt.user.id,
                name: receipt.user.name,
                email: receipt.user.email,
                phone: receipt.user.phone,
            }
            : null,
        service: receipt.service
            ? {
                id: receipt.service.id,
                title: receipt.service.title,
                description: receipt.service.description,
            }
            : null,
    });
    const receiptData = receipt;
    const pdfBuffer = await PDFGenerator.generateReceiptPDF(receiptData);
    const filename = `receipt-${receipt.receiptNo}-${Date.now()}.pdf`;
    const filepath = await PDFGenerator.savePDFToFile(pdfBuffer, filename);
    return {
        pdfBuffer,
        filepath,
        filename,
    };
};
export const generateReceiptsReport = async (filters) => {
    const receipts = await prisma.receipt.findMany({
        where: {
            ...(filters.startDate &&
                filters.endDate && {
                issuedAt: {
                    gte: new Date(filters.startDate),
                    lte: new Date(filters.endDate),
                },
            }),
            ...(filters.status && {
                invoice: { status: filters.status },
            }),
        },
        include: {
            invoice: {
                include: {
                    payment: {
                        include: {
                            booking: {
                                include: {
                                    user: true,
                                    service: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
    if (filters.format === 'excel') {
        const excelBuffer = await ExcelReportGenerator.generateReceiptsReport(receipts, filters);
        const filename = `receipts-report-${Date.now()}.xlsx`;
        const filepath = await ExcelReportGenerator.saveExcelToFile(excelBuffer, filename);
        return {
            buffer: excelBuffer,
            filepath,
            filename,
            format: 'excel',
        };
    }
    return {
        data: receipts,
        format: 'json',
    };
};
export const getReceiptStats = async () => {
    const [totalReceipts, totalValue, thisMonth, lastMonth] = await Promise.all([
        prisma.receipt.count(),
        prisma.receipt.aggregate({
            _sum: { id: true },
        }),
        prisma.receipt.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        }),
        prisma.receipt.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                    lte: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
                },
            },
        }),
    ]);
    return {
        totalReceipts,
        totalValue: Number(totalValue._sum.id) || 0,
        thisMonth,
        lastMonth,
        growth: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0,
    };
};
