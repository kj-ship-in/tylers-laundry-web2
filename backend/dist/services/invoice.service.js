/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../lib/prisma';
import ExcelReportGenerator from '../utils/excel-generator';
import PDFGenerator from '../utils/pdf-generator';
const generateInvoiceNumber = async () => {
    const lastInvoice = await prisma.invoice.findFirst({
        orderBy: { id: 'desc' },
        select: { invoiceNo: true },
    });
    let nextNumber = 1;
    if (lastInvoice?.invoiceNo) {
        const match = lastInvoice.invoiceNo.match(/INV-(\d+)/);
        if (match) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }
    return `INV-${nextNumber.toString().padStart(4, '0')}`;
};
export const createInvoice = async (data) => {
    // Always generate invoice number automatically
    const invoiceNo = await generateInvoiceNumber();
    const invoiceData = { ...data, invoiceNo };
    return prisma.invoice.create({
        data: invoiceData,
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
            receipt: true,
        },
    });
};
export const getAllInvoices = async (options) => {
    const { page = 1, limit = 10, status, startDate, endDate, search, } = options ?? {};
    const skip = (page - 1) * limit;
    const where = {};
    if (status) {
        where.status = status;
    }
    if (startDate && endDate) {
        where.issuedAt = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }
    if (search) {
        where.OR = [
            { invoiceNo: { contains: search, mode: 'insensitive' } },
            {
                payment: {
                    booking: {
                        user: { name: { contains: search, mode: 'insensitive' } },
                    },
                },
            },
            {
                payment: {
                    booking: {
                        user: { email: { contains: search, mode: 'insensitive' } },
                    },
                },
            },
        ];
    }
    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where,
            skip,
            take: limit,
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
                receipt: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        prisma.invoice.count({ where }),
    ]);
    return {
        invoices,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};
export const getInvoiceById = async (id) => {
    return prisma.invoice.findUnique({
        where: { id },
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
            receipt: true,
        },
    });
};
export const updateInvoice = async (id, data) => {
    return prisma.invoice.update({
        where: { id },
        data,
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
            receipt: true,
        },
    });
};
export const deleteInvoice = async (id) => {
    return prisma.invoice.delete({ where: { id } });
};
export const generateInvoicePDF = async (invoiceId) => {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
        throw new Error('Invoice not found');
    }
    const invoiceData = {
        invoice,
        payment: invoice.payment,
        booking: invoice.payment?.booking,
        user: invoice.payment?.booking?.user,
        service: invoice.payment?.booking?.service,
    };
    const pdfBuffer = await PDFGenerator.generateInvoicePDF(invoiceData);
    const filename = `invoice-${invoice.invoiceNo}-${Date.now()}.pdf`;
    const filepath = await PDFGenerator.savePDFToFile(pdfBuffer, filename);
    return {
        pdfBuffer,
        filepath,
        filename,
    };
};
export const generateInvoicesReport = async (filters) => {
    const invoices = await prisma.invoice.findMany({
        where: {
            ...(filters.status && { status: filters.status }),
            ...(filters.startDate &&
                filters.endDate && {
                issuedAt: {
                    gte: new Date(filters.startDate),
                    lte: new Date(filters.endDate),
                },
            }),
        },
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
            receipt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    if (filters.format === 'excel') {
        const excelBuffer = await ExcelReportGenerator.generateInvoicesReport(invoices, filters);
        const filename = `invoices-report-${Date.now()}.xlsx`;
        const filepath = await ExcelReportGenerator.saveExcelToFile(excelBuffer, filename);
        return {
            buffer: excelBuffer,
            filepath,
            filename,
            format: 'excel',
        };
    }
    else if (filters.format === 'pdf') {
        const pdfBuffer = await PDFGenerator.generateInvoicesReportPDF(invoices, filters);
        const filename = `invoices-report-${Date.now()}.pdf`;
        const filepath = await PDFGenerator.savePDFToFile(pdfBuffer, filename);
        return {
            buffer: pdfBuffer,
            filepath,
            filename,
            format: 'pdf',
        };
    }
    return {
        data: invoices,
        format: 'json',
    };
};
export const getOverdueInvoices = async (options) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
            where: {
                status: 'UNPAID',
                dueDate: {
                    lt: new Date(),
                },
            },
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
            skip,
            take: limit,
            orderBy: { dueDate: 'asc' },
        }),
        prisma.invoice.count({
            where: {
                status: 'UNPAID',
                dueDate: {
                    lt: new Date(),
                },
            },
        }),
    ]);
    return {
        invoices,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};
export const getInvoiceStats = async () => {
    const [totalInvoices, paidInvoices, unpaidInvoices, overdueInvoices, totalRevenue, unpaidAmount, monthlyRevenue,] = await Promise.all([
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: 'PAID' } }),
        prisma.invoice.count({ where: { status: 'UNPAID' } }),
        prisma.invoice.count({
            where: {
                status: 'UNPAID',
                dueDate: { lt: new Date() },
            },
        }),
        prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { status: 'PAID' },
        }),
        prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { status: 'UNPAID' },
        }),
        prisma.invoice.groupBy({
            by: ['issuedAt'],
            _sum: { totalAmount: true },
            _count: { id: true },
            where: {
                status: 'PAID',
                issuedAt: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
                },
            },
            orderBy: { issuedAt: 'asc' },
        }),
    ]);
    return {
        totalInvoices,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
        totalRevenue: totalRevenue._sum.totalAmount ?? 0,
        unpaidAmount: unpaidAmount._sum.totalAmount ?? 0,
        monthlyRevenue,
    };
};
export const markInvoiceAsPaid = async (invoiceId) => {
    return prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' },
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
            receipt: true,
        },
    });
};
