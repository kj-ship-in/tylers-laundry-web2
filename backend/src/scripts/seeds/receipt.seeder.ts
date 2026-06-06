/* eslint-disable no-console */
import { IInvoice } from '../../models/invoice.model';
import { Receipt } from '../../models/receipt.model';

export async function clearReceipts(): Promise<void> {
  await Receipt.deleteMany({});
  console.log('  Cleared: receipts');
}

export async function seedReceipts(invoices: IInvoice[]): Promise<void> {
  const receivers = [
    'Kiera Johnson',
    'Keoka Johnson',
    'Lamin Faye',
    'Kiera Johnson',
    'Keoka Johnson',
    'Lamin Faye',
    'Kiera Johnson',
    'Keoka Johnson',
  ];

  await Promise.all(
    invoices.map((invoice, i) =>
      Receipt.create({
        invoiceId: invoice._id,
        receiptNo: `REC-${String(i + 1).padStart(4, '0')}`,
        issuedAt: new Date(invoice.issuedAt),
        receivedBy: receivers[i % receivers.length],
        notes: 'Payment received in full.',
      }),
    ),
  );

  console.log(`  Seeded: receipts (${invoices.length} records)`);
}
