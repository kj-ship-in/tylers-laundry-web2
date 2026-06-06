import { InvoiceStatus } from './enums';

export interface InvoiceRequest{
  paymentId: string;
  totalAmount: number;
  tax: number;
  discount: number;
  issuedAt: string;
  dueDate: string;
  status?: InvoiceStatus;
}
