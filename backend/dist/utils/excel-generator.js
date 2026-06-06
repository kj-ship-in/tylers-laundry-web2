/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs/promises';
import path from 'path';
import ExcelJS from 'exceljs';
const ExcelReportGenerator = {
    async generateReceiptsReport(receipts, filters) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Receipts Report');
        worksheet.columns = [
            { header: 'Receipt No', key: 'receiptNo', width: 15 },
            { header: 'Invoice No', key: 'invoiceNo', width: 15 },
            { header: 'Customer Name', key: 'customerName', width: 20 },
            { header: 'Service Type', key: 'serviceType', width: 20 },
            { header: 'Amount', key: 'amount', width: 12 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 },
            { header: 'Issue Date', key: 'issueDate', width: 15 },
            { header: 'Received By', key: 'receivedBy', width: 20 },
            { header: 'Status', key: 'status', width: 12 },
        ];
        ExcelReportGenerator.styleHeader(worksheet);
        receipts.forEach((receipt, index) => {
            const row = worksheet.addRow({
                receiptNo: receipt.receiptNo,
                invoiceNo: receipt.invoice?.invoiceNo ?? 'N/A',
                customerName: receipt.invoice?.payment?.booking?.user?.name ?? 'N/A',
                serviceType: receipt.invoice?.payment?.booking?.service?.type ?? 'N/A',
                amount: receipt.invoice?.payment?.amount ?? 0,
                paymentMethod: receipt.invoice?.payment?.method ?? 'N/A',
                issueDate: new Date(receipt.issuedAt).toLocaleDateString(),
                receivedBy: receipt.receivedBy ?? 'N/A',
                status: receipt.invoice?.status ?? 'N/A',
            });
            if (index % 2 === 0) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8F9FA' },
                };
            }
        });
        ExcelReportGenerator.addSummarySection(worksheet, receipts, 'Receipts');
        ExcelReportGenerator.addFiltersInfo(worksheet, filters);
        return await workbook.xlsx.writeBuffer();
    },
    async generateInvoicesReport(invoices, filters) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Invoices Report');
        worksheet.columns = [
            { header: 'Invoice No', key: 'invoiceNo', width: 15 },
            { header: 'Customer Name', key: 'customerName', width: 20 },
            { header: 'Service Type', key: 'serviceType', width: 20 },
            { header: 'Total Amount', key: 'totalAmount', width: 12 },
            { header: 'Tax', key: 'tax', width: 10 },
            { header: 'Discount', key: 'discount', width: 10 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Issue Date', key: 'issueDate', width: 15 },
            { header: 'Due Date', key: 'dueDate', width: 15 },
            { header: 'Payment Status', key: 'paymentStatus', width: 15 },
        ];
        ExcelReportGenerator.styleHeader(worksheet);
        invoices.forEach((invoice, index) => {
            const row = worksheet.addRow({
                invoiceNo: invoice.invoiceNo,
                customerName: invoice.payment?.booking?.user?.name ?? 'N/A',
                serviceType: invoice.payment?.booking?.service?.type ?? 'N/A',
                totalAmount: invoice.totalAmount,
                tax: invoice.tax,
                discount: invoice.discount,
                status: invoice.status,
                issueDate: new Date(invoice.issuedAt).toLocaleDateString(),
                dueDate: new Date(invoice.dueDate).toLocaleDateString(),
                paymentStatus: invoice.payment?.status ?? 'N/A',
            });
            if (index % 2 === 0) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8F9FA' },
                };
            }
            if (invoice.status === 'UNPAID') {
                row.getCell('status').fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFEAA7' },
                };
            }
        });
        ExcelReportGenerator.addSummarySection(worksheet, invoices, 'Invoices');
        ExcelReportGenerator.addFiltersInfo(worksheet, filters);
        return await workbook.xlsx.writeBuffer();
    },
    async generateFinancialReport(data) {
        const workbook = new ExcelJS.Workbook();
        const summarySheet = workbook.addWorksheet('Financial Summary');
        const paymentsSheet = workbook.addWorksheet('Payments Detail');
        const revenueSheet = workbook.addWorksheet('Revenue by Service');
        ExcelReportGenerator.createFinancialSummary(summarySheet, data.summary);
        ExcelReportGenerator.createPaymentsDetail(paymentsSheet, data.payments);
        ExcelReportGenerator.createRevenueByService(revenueSheet, data.revenueByService);
        return await workbook.xlsx.writeBuffer();
    },
    async generateCustomerReport(customers, filters) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Customer Report');
        worksheet.columns = [
            { header: 'Customer ID', key: 'id', width: 12 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Total Bookings', key: 'totalBookings', width: 15 },
            { header: 'Total Spent', key: 'totalSpent', width: 15 },
            { header: 'Last Booking', key: 'lastBooking', width: 15 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Join Date', key: 'joinDate', width: 15 },
        ];
        ExcelReportGenerator.styleHeader(worksheet);
        customers.forEach((customer, index) => {
            const row = worksheet.addRow({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone ?? 'N/A',
                totalBookings: customer._count?.bookings ?? 0,
                totalSpent: customer.totalSpent ?? 0,
                lastBooking: customer.lastBookingDate
                    ? new Date(customer.lastBookingDate).toLocaleDateString()
                    : 'N/A',
                status: customer.isActive ? 'Active' : 'Inactive',
                joinDate: new Date(customer.createdAt).toLocaleDateString(),
            });
            if (index % 2 === 0) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8F9FA' },
                };
            }
        });
        ExcelReportGenerator.addSummarySection(worksheet, customers, 'Customers');
        ExcelReportGenerator.addFiltersInfo(worksheet, filters);
        return await workbook.xlsx.writeBuffer();
    },
    styleHeader(worksheet) {
        const headerRow = worksheet.getRow(1);
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4A90E2' },
        };
        headerRow.font = {
            color: { argb: 'FFFFFFFF' },
            bold: true,
        };
        headerRow.alignment = { horizontal: 'center' };
    },
    addSummarySection(worksheet, data, type) {
        const lastRow = worksheet.rowCount + 2;
        worksheet.mergeCells(`A${lastRow}:I${lastRow}`);
        const summaryTitleRow = worksheet.getRow(lastRow);
        summaryTitleRow.getCell(1).value = `${type} Summary`;
        summaryTitleRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE8F4FD' },
        };
        summaryTitleRow.font = { bold: true };
        const summaryData = [
            [`Total ${type}:`, data.length],
            ['Report Generated:', new Date().toLocaleString()],
        ];
        if (type === 'Invoices') {
            const totalAmount = data.reduce((sum, invoice) => sum + Number(invoice.totalAmount ?? 0), 0);
            const paidAmount = data
                .filter(invoice => invoice.status === 'PAID')
                .reduce((sum, invoice) => sum + Number(invoice.totalAmount ?? 0), 0);
            const unpaidAmount = totalAmount - paidAmount;
            summaryData.push(['Total Amount:', `GMD${totalAmount.toFixed(2)}`], ['Paid Amount:', `GMD${paidAmount.toFixed(2)}`], ['Unpaid Amount:', `GMD${unpaidAmount.toFixed(2)}`]);
        }
        if (type === 'Receipts') {
            const totalAmount = data.reduce((sum, receipt) => {
                return sum + Number(receipt.invoice?.payment?.amount ?? 0);
            }, 0);
            summaryData.push(['Total Amount:', `GMD${totalAmount.toFixed(2)}`]);
        }
        summaryData.forEach((item, index) => {
            const row = worksheet.getRow(lastRow + 1 + index);
            row.getCell(1).value = item[0];
            row.getCell(2).value = item[1];
            row.getCell(1).font = { bold: true };
        });
    },
    addFiltersInfo(worksheet, filters) {
        const lastRow = worksheet.rowCount + 2;
        worksheet.mergeCells(`A${lastRow}:I${lastRow}`);
        const filtersRow = worksheet.getRow(lastRow);
        filtersRow.getCell(1).value = 'Applied Filters';
        filtersRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF3CD' },
        };
        filtersRow.font = { bold: true };
        Object.entries(filters).forEach(([key, value], index) => {
            if (value) {
                const row = worksheet.getRow(lastRow + 1 + index);
                row.getCell(1).value = `${key}:`;
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                row.getCell(2).value = value ? String(value) : 'Applied';
            }
        });
    },
    createFinancialSummary(worksheet, summary) {
        worksheet.columns = [
            { header: 'Metric', key: 'metric', width: 25 },
            { header: 'Value', key: 'value', width: 20 },
        ];
        ExcelReportGenerator.styleHeader(worksheet);
        const summaryData = [
            {
                metric: 'Total Revenue',
                value: `GMD${summary.totalRevenue.toFixed(2)}`,
            },
            { metric: 'Total Payments', value: summary.totalPayments },
            {
                metric: 'Average Order Value',
                value: `GMD${summary.averageOrderValue.toFixed(2)}`,
            },
            { metric: 'Paid Invoices', value: summary.paidInvoices },
            { metric: 'Unpaid Invoices', value: summary.unpaidInvoices },
            {
                metric: 'Total Tax Collected',
                value: `GMD${summary.totalTax.toFixed(2)}`,
            },
            {
                metric: 'Total Discounts Given',
                value: `GMD${summary.totalDiscounts.toFixed(2)}`,
            },
        ];
        summaryData.forEach(item => {
            worksheet.addRow(item);
        });
    },
    createPaymentsDetail(worksheet, payments) {
        worksheet.columns = [
            { header: 'Transaction ID', key: 'transactionId', width: 20 },
            { header: 'Customer', key: 'customer', width: 20 },
            { header: 'Amount', key: 'amount', width: 12 },
            { header: 'Method', key: 'method', width: 12 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Date', key: 'date', width: 15 },
        ];
        ExcelReportGenerator.styleHeader(worksheet);
        payments.forEach(payment => {
            worksheet.addRow({
                transactionId: payment.transactionId,
                customer: payment.booking?.user?.name ?? 'N/A',
                amount: payment.amount,
                method: payment.method,
                status: payment.status,
                date: new Date(payment.createdAt).toLocaleDateString(),
            });
        });
    },
    createRevenueByService(worksheet, revenueData) {
        worksheet.columns = [
            { header: 'Service Type', key: 'serviceType', width: 25 },
            { header: 'Total Revenue', key: 'revenue', width: 15 },
            { header: 'Number of Orders', key: 'orders', width: 15 },
            { header: 'Average Price', key: 'averagePrice', width: 15 },
        ];
        ExcelReportGenerator.styleHeader(worksheet);
        revenueData.forEach(service => {
            worksheet.addRow({
                serviceType: service.type,
                revenue: service.totalRevenue,
                orders: service.orderCount,
                averagePrice: service.averagePrice,
            });
        });
    },
    async saveExcelToFile(excelBuffer, filename) {
        const uploadsDir = 'uploads/reports';
        await fs.mkdir(uploadsDir, { recursive: true });
        const filepath = path.join(uploadsDir, filename);
        await fs.writeFile(filepath, excelBuffer);
        return filepath;
    },
};
export default ExcelReportGenerator;
