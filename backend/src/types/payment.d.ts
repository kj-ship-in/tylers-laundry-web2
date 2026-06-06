import { PaymentMethod, PaymentStatus, InvoiceStatus } from './enums';

export interface PaymentRequest {
  bookingId: string;
  transactionId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status?: PaymentStatus;
  gatewayResponse?: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  gatewayResponse?: string;
}

export interface UpdatePaymentRequest {
  status?: PaymentStatus;
  gatewayResponse?: string;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export interface PaymentResponse {
  id: string;
  bookingId: string;
  transactionId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayResponse?: string;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    userId: string;
    service: {
      type: string;
      description?: string;
    };
  };
  invoice?: InvoiceResponse;
}

export interface CreateInvoiceRequest {
  paymentId: string;
  totalAmount: number;
  tax: number;
  discount: number;
  dueDate: string;
}

export interface UpdateInvoiceRequest {
  status?: InvoiceStatus;
  tax?: number;
  discount?: number;
  dueDate?: string;
}

export interface InvoiceResponse {
  id: string;
  paymentId: string;
  invoiceNo: string;
  totalAmount: number;
  tax: number;
  discount: number;
  issuedAt: string;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
  receipt?: ReceiptResponse;
}

export interface CreateReceiptRequest {
  invoiceId: string;
  receivedBy?: string;
  notes?: string;
}

export interface UpdateReceiptRequest {
  receivedBy?: string;
  notes?: string;
}

export interface ReceiptResponse {
  id: string;
  invoiceId: string;
  receiptNo: string;
  issuedAt: string;
  receivedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
