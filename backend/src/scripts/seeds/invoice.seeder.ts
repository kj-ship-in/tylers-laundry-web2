/* eslint-disable no-console */
import { Invoice, IInvoice } from '../../models/invoice.model';
import { IPayment } from '../../models/payment.model';
import { InvoiceStatus } from '../../types/enums';

export async function clearInvoices(): Promise<void> {
  await Invoice.deleteMany({});
  console.log('  Cleared: invoices');
}

export async function seedInvoices(payments: IPayment[]): Promise<IInvoice[]> {
  const TAX_RATE = 0.05;

  const invoices = await Promise.all(
    payments.map((payment, i) => {
      const tax = parseFloat((payment.amount * TAX_RATE).toFixed(2));
      const issuedAt = new Date(payment.createdAt);
      const dueDate = new Date(issuedAt);
      dueDate.setDate(dueDate.getDate() + 7);

      return Invoice.create({
        paymentId: payment._id,
        invoiceNo: `INV-${String(i + 1).padStart(4, '0')}`,
        totalAmount: payment.amount,
        tax,
        discount: 0.0,
        issuedAt,
        dueDate,
        status: InvoiceStatus.PAID,
      });
    }),
  );

  console.log(`  Seeded: invoices (${invoices.length} records)`);
  return invoices;
}
