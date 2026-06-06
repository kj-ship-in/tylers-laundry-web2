import { Receipt } from './receipt.d';
import type { InvoiceResponse } from './payment';

export interface ReceiptRequest {
  invoiceId: string;
  issuedAt: string;
  receivedBy?: string;
  notes?: string;
}

export interface ReceiptParams {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  status?: string;
  search?: string;
}
export interface Receipt {
  _id: string;
  invoiceId: string;
  receiptNo: string;
  issuedAt: string;
  receivedBy: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  invoice: InvoiceResponse;
}

export interface ReceiptStats {
  totalReceipts: number;
  totalValue: number;
  thisMonth: number;
  lastMonth: number;
  growth: number;
}
