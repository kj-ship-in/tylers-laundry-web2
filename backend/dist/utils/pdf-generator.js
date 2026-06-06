"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const puppeteer_1 = __importDefault(require("puppeteer"));
let browser = null;
const PDFGenerator = {
    async initBrowser() {
        browser ??= await puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        return browser;
    },
    async closeBrowser() {
        if (browser) {
            await browser.close();
            browser = null;
        }
    },
    async generateReceiptPDF(receiptData) {
        try {
            console.log('Generating receipt PDF with data:', receiptData ? 'data present' : 'no data');
            const browser = await this.initBrowser();
            const page = await browser.newPage();
            const html = this.generateReceiptHTML(receiptData);
            console.log('Generated HTML length:', html.length);
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px',
                },
            });
            await page.close();
            console.log('PDF generated successfully, size:', pdf.length);
            return pdf;
        }
        catch (error) {
            console.error('Error generating receipt PDF:', error);
            throw error;
        }
    },
    async generateInvoicePDF(invoiceData) {
        const browser = await this.initBrowser();
        const page = await browser.newPage();
        const html = this.generateInvoiceHTML(invoiceData);
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px',
            },
        });
        await page.close();
        return pdf;
    },
    async generateReceiptsReportPDF(receiptsData, filters) {
        try {
            console.log('🔍 PDF Generator: generateReceiptsReportPDF called with', receiptsData.length, 'receipts');
            const browser = await this.initBrowser();
            const page = await browser.newPage();
            const html = this.generateReceiptsReportHTML(receiptsData, filters);
            console.log('🔍 PDF Generator: Generated HTML length:', html.length);
            console.log('🔍 PDF Generator: HTML preview:', html.substring(0, 500) + '...');
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    right: '20px',
                    bottom: '20px',
                    left: '20px',
                },
                landscape: true, // Landscape for better table display
            });
            await page.close();
            return pdf;
        }
        catch (error) {
            console.error('Error generating receipts report PDF:', error);
            throw error;
        }
    },
    generateReceiptHTML(receiptData) {
        console.log('PDF Generator received receiptData:', JSON.stringify(receiptData, null, 2));
        // receiptData is now the flattened object with direct properties
        const receipt = receiptData;
        const invoice = receiptData.invoice;
        const payment = receiptData.payment;
        const booking = receiptData.booking;
        const user = receiptData.user;
        const service = receiptData.service;
        console.log('Flattened data:', {
            receipt: !!receipt,
            invoice: !!invoice,
            payment: !!payment,
            booking: !!booking,
            user: !!user,
            service: !!service,
        });
        // Helper function to safely get nested properties
        const safeGet = (obj, path, defaultValue = 'N/A') => {
            try {
                const keys = path.split('.');
                let current = obj;
                for (const key of keys) {
                    if (current == null)
                        return defaultValue;
                    current = current[key];
                }
                return current ?? defaultValue;
            }
            catch {
                return defaultValue;
            }
        };
        console.log('Sample values:', {
            receiptNo: safeGet(receipt, 'receiptNo'),
            invoiceNo: safeGet(invoice, 'invoiceNo'),
            userName: safeGet(user, 'name'),
            serviceType: safeGet(service, 'type'),
            paymentMethod: safeGet(payment, 'method'),
        });
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${safeGet(receipt, 'receiptNo', 'Unknown')}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #4A90E2;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #4A90E2;
            margin-bottom: 5px;
          }
          .document-title {
            font-size: 24px;
            color: #666;
            margin-top: 10px;
          }
          .content {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .left-column, .right-column {
            width: 48%;
          }
          .info-section {
            margin-bottom: 20px;
          }
          .info-title {
            font-weight: bold;
            color: #4A90E2;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 4px;
          }
          .info-item {
            margin-bottom: 5px;
          }
          .amount-section {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            margin: 16px 0;
          }
          .amount-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .total-amount {
            font-size: 18px;
            font-weight: bold;
            color: #4A90E2;
            border-top: 2px solid #4A90E2;
            padding-top: 10px;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status.paid {
            background: #d4edda;
            color: #155724;
          }
          .qr-section {
            text-align: center;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Tyler's Laundry Service</div>
          <div style="color: #666; margin: 5px 0;">Professional Laundry & Dry Cleaning</div>
          <div class="document-title">RECEIPT</div>
        </div>

        <div class="content">
          <div class="left-column">
            <div class="info-section">
              <div class="info-title">Receipt Information</div>
              <div class="info-item"><strong>Receipt No:</strong> ${safeGet(receipt, 'receiptNo')}</div>
              <div class="info-item"><strong>Issue Date:</strong> ${receipt?.issuedAt ? new Date(receipt.issuedAt).toLocaleDateString() : 'N/A'}</div>
              <div class="info-item"><strong>Invoice No:</strong> ${safeGet(invoice, 'invoiceNo')}</div>
              ${safeGet(receipt, 'receivedBy') ? `<div class="info-item"><strong>Received By:</strong> ${safeGet(receipt, 'receivedBy')}</div>` : ''}
            </div>

            <div class="info-section">
              <div class="info-title">Customer Information</div>
              <div class="info-item"><strong>Name:</strong> ${safeGet(user, 'name')}</div>
              <div class="info-item"><strong>Email:</strong> ${safeGet(user, 'email')}</div>
              ${safeGet(user, 'phone') ? `<div class="info-item"><strong>Phone:</strong> ${safeGet(user, 'phone')}</div>` : ''}
            </div>
          </div>

          <div class="right-column">
            <div class="info-section">
              <div class="info-title">Service Details</div>
              <div class="info-item"><strong>Service:</strong> ${safeGet(service, 'title')}</div>
              ${safeGet(service, 'description') ? `<div class="info-item"><strong>Description:</strong> ${safeGet(service, 'description')}</div>` : ''}
              <div class="info-item"><strong>Booking Date:</strong> ${booking?.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</div>
              <div class="info-item"><strong>Status:</strong> <span class="status paid">${safeGet(booking, 'status')}</span></div>
            </div>

            <div class="info-section">
              <div class="info-title">Payment Information</div>
              <div class="info-item"><strong>Method:</strong> ${safeGet(payment, 'method')}</div>
              <div class="info-item"><strong>Transaction ID:</strong> ${safeGet(payment, 'transactionId')}</div>
              <div class="info-item"><strong>Status:</strong> <span class="status paid">${safeGet(payment, 'status')}</span></div>
            </div>
          </div>
        </div>

        <div class="amount-section">
          <div class="amount-row">
            <span>Service Amount:</span>
            <span>GMD${booking ? Number((booking.totalAmount ?? 0) - (booking.deliveryFee ?? 0)).toFixed(2) : '0.00'}</span>
          </div>
          <div class="amount-row">
            <span>Delivery Fee:</span>
            <span>GMD${booking ? Number(booking.deliveryFee ?? 0).toFixed(2) : '0.00'}</span>
          </div>
          <div class="amount-row">
            <span>Tax:</span>
            <span>GMD${invoice ? Number(invoice.tax ?? 0).toFixed(2) : '0.00'}</span>
          </div>
          ${invoice && Number(invoice.discount ?? 0) > 0
            ? `
          <div class="amount-row">
            <span>Discount:</span>
            <span>-GMD${Number(invoice.discount).toFixed(2)}</span>
          </div>
          `
            : ''}
          <div class="amount-row total-amount">
            <span>Total Paid:</span>
            <span>GMD${payment ? Number(payment.amount ?? 0).toFixed(2) : '0.00'}</span>
          </div>
        </div>

        ${safeGet(receipt, 'notes')
            ? `
        <div class="info-section">
          <div class="info-title">Notes</div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${safeGet(receipt, 'notes')}
          </div>
        </div>
        `
            : ''}

        <div class="footer">
          <p><strong>Thank you for choosing Tyler's Laundry Service!</strong></p>
          <p>For questions about this receipt, please contact us at support@tylerslaundry.com</p>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
    },
    generateInvoiceHTML(invoiceData) {
        const { invoice, payment, booking, user, service } = invoiceData;
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${invoice.invoiceNo}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 30px;
            color: #444;
            line-height: 1.5;
            font-size: 13px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #3b82f6;
          }
          .company-name {
            font-size: 28px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 3px;
          }
          .company-tagline {
            color: #f97316;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 10px;
          }
          .document-title {
            font-size: 24px;
            font-weight: 700;
            color: #2563eb;
            margin-top: 8px;
          }
          .invoice-meta {
            text-align: center;
            margin-bottom: 20px;
          }
          .invoice-meta span {
            display: inline-block;
            margin: 0 15px;
            color: #444;
          }
          .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .info-section {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border-left: 3px solid #3b82f6;
          }
          .info-title {
            font-weight: 700;
            font-size: 13px;
            color: #2563eb;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .info-item {
            margin-bottom: 6px;
            font-size: 12px;
          }
          .info-item strong {
            color: #444;
            font-weight: 600;
            min-width: 90px;
            display: inline-block;
          }
          .amount-section {
            background: linear-gradient(135deg, #eff6ff 0%, #fff7ed 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 2px solid #3b82f6;
          }
          .amount-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          .amount-row span:last-child {
            font-weight: 600;
            color: #2563eb;
          }
          .total-amount {
            font-size: 18px;
            font-weight: 700;
            border-top: 2px solid #f97316;
            padding-top: 10px;
            margin-top: 10px;
          }
          .total-amount span:last-child {
            color: #f97316;
            font-size: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #e5e7eb;
            font-size: 11px;
            color: #444;
          }
          .footer strong {
            color: #2563eb;
            font-size: 13px;
          }
          .payment-methods {
            color: #f97316;
            font-weight: 600;
            margin: 5px 0;
          }
          .status {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
          }
          .status.paid {
            background: #dcfce7;
            color: #166534;
          }
          .status.unpaid {
            background: #fee2e2;
            color: #991b1b;
          }
          .status.pending {
            background: #fef3c7;
            color: #92400e;
          }
          .due-date {
            background: #fff7ed;
            border: 2px solid #f97316;
            padding: 12px;
            border-radius: 6px;
            margin: 15px 0;
            text-align: center;
            color: #ea580c;
            font-weight: 600;
            font-size: 13px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">Tyler's Laundry</div>
            <div class="company-tagline">Professional Laundry & Dry Cleaning</div>
            <div class="document-title">INVOICE</div>
          </div>

          <div class="invoice-meta">
            <span><strong>Invoice #:</strong> ${invoice.invoiceNo}</span>
            <span><strong>Date:</strong> ${new Date(invoice.issuedAt).toLocaleDateString()}</span>
            <span><strong>Due:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</span>
            <span><strong>Status:</strong> <span class="status ${invoice.status.toLowerCase()}">${invoice.status}</span></span>
          </div>

          ${invoice.status === 'UNPAID'
            ? `<div class="due-date">⚠️ Payment Due: ${new Date(invoice.dueDate).toLocaleDateString()} - Please ensure payment is made by the due date</div>`
            : ''}

          <div class="content">
            <div class="info-section">
              <div class="info-title">Customer Information</div>
              <div class="info-item"><strong>Name:</strong> ${user.name}</div>
              <div class="info-item"><strong>Email:</strong> ${user.email}</div>
              ${user.phone ? `<div class="info-item"><strong>Phone:</strong> ${user.phone}</div>` : ''}
              ${user.address ? `<div class="info-item"><strong>Address:</strong> ${user.address}</div>` : ''}
            </div>

            <div class="info-section">
              <div class="info-title">Service Details</div>
              <div class="info-item"><strong>Service:</strong> ${service.type}</div>
              ${service.description ? `<div class="info-item"><strong>Description:</strong> ${service.description}</div>` : ''}
              <div class="info-item"><strong>Booking:</strong> ${new Date(booking.date).toLocaleDateString()}</div>
              <div class="info-item"><strong>Pickup:</strong> ${booking.pickupAddress}</div>
              <div class="info-item"><strong>Delivery:</strong> ${booking.deliveryAddress}</div>
            </div>
          </div>

          ${payment
            ? `
          <div class="info-section" style="margin-bottom: 20px;">
            <div class="info-title">Payment Information</div>
            <div class="info-item"><strong>Method:</strong> ${payment.method}</div>
            <div class="info-item"><strong>Transaction ID:</strong> ${payment.transactionId}</div>
            <div class="info-item"><strong>Status:</strong> <span class="status ${payment.status.toLowerCase()}">${payment.status}</span></div>
          </div>
          `
            : ''}

          <div class="amount-section">
            <div class="amount-row">
              <span>Service Amount</span>
              <span>GMD ${Number(booking.totalAmount - booking.deliveryFee).toFixed(2)}</span>
            </div>
            <div class="amount-row">
              <span>Delivery Fee</span>
              <span>GMD ${Number(booking.deliveryFee).toFixed(2)}</span>
            </div>
            <div class="amount-row">
              <span>Tax</span>
              <span>GMD ${Number(invoice.tax).toFixed(2)}</span>
            </div>
            ${Number(invoice.discount) > 0
            ? `
            <div class="amount-row">
              <span>Discount</span>
              <span style="color: #f97316;">-GMD ${Number(invoice.discount).toFixed(2)}</span>
            </div>
            `
            : ''}
            <div class="amount-row total-amount">
              <span>Total Amount</span>
              <span>GMD ${Number(invoice.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            <p><strong>Tyler's Laundry Service</strong></p>
            <p>For questions: billing@tylerslaundry.com</p>
            <p class="payment-methods">WAVE | APS | YONNA | BANK | CASH</p>
            <p style="margin-top: 10px; color: #6b7280;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    },
    async savePDFToFile(pdfBuffer, filename) {
        const uploadsDir = 'uploads/reports';
        await promises_1.default.mkdir(uploadsDir, { recursive: true });
        const filepath = path_1.default.join(uploadsDir, filename);
        await promises_1.default.writeFile(filepath, pdfBuffer);
        return filepath;
    },
    async generateInvoicesReportPDF(invoices, filters) {
        const browser = await this.initBrowser();
        const page = await browser.newPage();
        const html = this.generateInvoicesReportHTML(invoices, filters);
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px',
            },
            landscape: true, // Landscape for table
        });
        await page.close();
        return pdf;
    },
    generateInvoicesReportHTML(invoices, filters) {
        const reportTitle = 'Invoices Report';
        const generatedAt = new Date().toLocaleString();
        let filterInfo = '';
        if (filters.startDate && filters.endDate) {
            filterInfo += `Date Range: ${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}<br>`;
        }
        if (filters.status) {
            filterInfo += `Status: ${filters.status}<br>`;
        }
        const tableRows = invoices
            .map(invoice => `
      <tr>
        <td>${invoice.invoiceNo}</td>
        <td>${invoice.payment?.booking?.user?.name ?? 'N/A'}</td>
        <td>${invoice.payment?.booking?.service?.type ?? 'N/A'}</td>
        <td>GMD ${invoice.totalAmount?.toFixed(2)}</td>
        <td>GMD ${invoice.tax?.toFixed(2)}</td>
        <td>GMD ${invoice.discount?.toFixed(2)}</td>
        <td>${invoice.status}</td>
        <td>${new Date(invoice.issuedAt).toLocaleDateString()}</td>
        <td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
        <td>${invoice.payment?.status ?? 'N/A'}</td>
      </tr>
    `)
            .join('');
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4A90E2;
            padding-bottom: 20px;
          }
          .report-title {
            font-size: 28px;
            font-weight: bold;
            color: #4A90E2;
            margin-bottom: 10px;
          }
          .report-info {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .filters {
            font-size: 12px;
            color: #888;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #333;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="report-title">${reportTitle}</div>
          <div class="report-info">Generated on: ${generatedAt}</div>
          <div class="filters">${filterInfo}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer Name</th>
              <th>Service Type</th>
              <th>Total Amount</th>
              <th>Tax</th>
              <th>Discount</th>
              <th>Status</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <p>Total Invoices: ${invoices.length}</p>
          <p>Report generated by Tyler's Laundry API</p>
        </div>
      </body>
      </html>
    `;
    },
    generateReceiptsReportHTML(receiptsData, filters) {
        console.log('🔍 PDF Generator: generateReceiptsReportHTML called with', receiptsData.length, 'receipts');
        if (receiptsData.length === 0) {
            console.log('🔍 PDF Generator: No receipts data provided');
        }
        else {
            console.log('🔍 PDF Generator: First receipt sample:', {
                receiptNo: receiptsData[0].receiptNo,
                user: receiptsData[0].user?.name,
                service: receiptsData[0].service?.title,
                payment: receiptsData[0].payment?.amount,
            });
        }
        const reportTitle = 'Receipts Report';
        const generatedAt = new Date().toLocaleString();
        const filterInfo = this.buildFilterInfo(filters);
        // Calculate totals
        const totalAmount = receiptsData.reduce((sum, receipt) => {
            const amount = receipt.payment?.amount ?? 0;
            return (sum + (typeof amount === 'string' ? parseFloat(amount) : Number(amount)));
        }, 0);
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.4;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #4A90E2;
            padding-bottom: 15px;
          }
          .report-title {
            font-size: 24px;
            font-weight: bold;
            color: #4A90E2;
            margin-bottom: 5px;
          }
          .report-info {
            color: #666;
            margin: 3px 0;
          }
          .filters {
            color: #666;
            font-style: italic;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #4A90E2;
          }
          tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          tr:hover {
            background-color: #e3f2fd;
          }
          .amount {
            text-align: right;
            font-weight: bold;
          }
          .total-row {
            background-color: #4A90E2 !important;
            color: white;
            font-weight: bold;
          }
          .total-row td {
            border-color: #4A90E2;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 10px;
          }
          .status {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .status.completed {
            background: #d4edda;
            color: #155724;
          }
          .status.pending {
            background: #fff3cd;
            color: #856404;
          }
          .status.cancelled {
            background: #f8d7da;
            color: #721c24;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="report-title">${reportTitle}</div>
          <div class="report-info">Generated on: ${generatedAt}</div>
          <div class="filters">${filterInfo}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Receipt No</th>
              <th>Issue Date</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${receiptsData
            .map(receipt => {
            const user = receipt.user;
            const service = receipt.service;
            const payment = receipt.payment;
            const rowHtml = `
                <tr>
                  <td>${receipt.receiptNo ?? 'N/A'}</td>
                  <td>${receipt.issuedAt ? new Date(receipt.issuedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>${user?.name ?? 'N/A'}</td>
                  <td>${service?.title ?? 'N/A'}</td>
                  <td class="amount">GMD${payment?.amount ? Number(payment.amount).toFixed(2) : '0.00'}</td>
                  <td>${payment?.method ?? 'N/A'}</td>
                  <td><span class="status completed">${payment?.status ?? 'N/A'}</span></td>
                </tr>
              `;
            console.log('🔍 PDF Generator: Generated row HTML:', rowHtml.trim());
            return rowHtml;
        })
            .join('')}
            <tr class="total-row">
              <td colspan="4" style="text-align: right; font-weight: bold;">TOTAL:</td>
              <td class="amount">GMD${totalAmount.toFixed(2)}</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Total Receipts: ${receiptsData.length}</p>
          <p>Report generated by Tyler's Laundry API</p>
        </div>
      </body>
      </html>
    `;
    },
    buildFilterInfo(filters) {
        const parts = [];
        if (filters.startDate && filters.endDate) {
            parts.push(`Date Range: ${filters.startDate} to ${filters.endDate}`);
        }
        if (filters.status) {
            parts.push(`Status: ${filters.status}`);
        }
        return parts.length > 0
            ? `Filters: ${parts.join(', ')}`
            : 'No filters applied';
    },
};
exports.default = PDFGenerator;
