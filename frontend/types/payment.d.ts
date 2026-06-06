export type PaymentMethod = 'CASH' | 'WAVE' | 'APS' | 'BANK' | 'YONNA';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type InvoiceStatus = 'UNPAID' | 'PAID' | 'CANCELLED' | 'OVERDUE';
export interface PaymentRequest {
  bookingId: string;
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
  _id: string;
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
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
    };
    service: {
      title: string;
      type: string;
      description?: string;
    };
  };
  user?: {
    _id: string;
    name: string;
    phone: string;
  };
  invoice?: InvoiceResponse;
}

export interface CreateInvoiceRequest {
  paymentId: string;
  totalAmount: number;
  tax: number;
  discount: number;
  issuedAt: string;
  dueDate: string;
  status?: InvoiceStatus;
}

export interface UpdateInvoiceRequest {
  status?: InvoiceStatus;
  tax?: number;
  discount?: number;
  dueDate?: string;
}

export interface InvoiceResponse {
  _id: string;
  payment: {
    _id: string;
    transactionId: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    booking: {
      _id: string;
      user: {
        _id: string;
        name: string;
        email: string;
      };
      service: {
        _id: string;
        title: string;
        type: string;
      };
    };
  };
  invoiceNo: string;
  totalAmount: number;
  tax: number;
  discount: number;
  issuedAt: string;
  dueDate: string;
  status: 'UNPAID' | 'PAID' | 'CANCELLED' | 'OVERDUE';
  receipt?: {
    _id: string;
    receiptNo: string;
    issuedAt: string;
  };
  createdAt: string;
  updatedAt: string;
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
  _id: string;
  invoiceId: string;
  receiptNo: string;
  issuedAt: string;
  receivedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentApiResponse {
  data: PaymentResponse;
  message: string;
}
