export interface ReceiptRequest{
  invoiceId: string;
  receiptNo?: string;
  issuedAt: string;
  receivedBy?: string;
  notes?: string;
}