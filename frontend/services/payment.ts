import type { ApiResponse } from '@/types/user';
import type {
  PaymentResponse,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaymentQueryParams,
  InvoiceResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  ReceiptResponse,
  CreateReceiptRequest,
  UpdateReceiptRequest,
  PaymentApiResponse,
} from '@/types/payment';
import apiClient from '@/utils/api-client';

/**
 * Create a new payment
 */
export const createPayment = async (
  payload: CreatePaymentRequest,
): Promise<PaymentApiResponse> => {
  const response = await apiClient.post<PaymentApiResponse>(
    '/payments/create',
    payload,
  );
  return response.data;
};

/**
 * Get all payments with pagination and filters
 */
export const getAllPayments = async (
  params: PaymentQueryParams,
): Promise<ApiResponse<PaymentResponse[]>> => {
  const response = await apiClient.get<ApiResponse<PaymentResponse[]>>(
    '/payments/getAll',
    { params },
  );
  return response.data;
};

/**
 * Get a payment by ID
 */
export const getPaymentById = async (
  paymentId: string,
): Promise<PaymentResponse> => {
  const response = await apiClient.get<PaymentResponse>(
    `/payments/get/${paymentId}`,
  );
  return response.data;
};

/**
 * Update a payment
 */
export const updatePayment = async (
  paymentId: string,
  payload: UpdatePaymentRequest,
): Promise<PaymentResponse> => {
  const response = await apiClient.put<PaymentResponse>(
    `/payments/update/${paymentId}`,
    payload,
  );
  return response.data;
};

/**
 * Delete a payment
 */
export const deletePayment = async (
  paymentId: string,
): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/payments/delete/${paymentId}`,
  );
  return response.data;
};

/**
 * Get payments by booking ID
 */
export const getPaymentsByBookingId = async (
  bookingId: string,
): Promise<PaymentResponse[]> => {
  const response = await apiClient.get<PaymentResponse[]>(
    `/payments/booking/${bookingId}`,
  );
  return response.data;
};

/**
 * Process payment (mark as paid)
 */
export const processPayment = async (
  paymentId: string,
): Promise<PaymentResponse> => {
  const response = await apiClient.post<PaymentResponse>(
    `/payments/mark-paid/${paymentId}`,
  );
  return response.data;
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  paymentId: string,
): Promise<PaymentResponse> => {
  const response = await apiClient.patch<PaymentResponse>(
    `/payments/status/${paymentId}`,
  );
  return response.data;
};

/**
 * Refund payment
 */
export const refundPayment = async (
  paymentId: string,
  reason?: string,
): Promise<PaymentResponse> => {
  const response = await apiClient.post<PaymentResponse>(
    `/payments/refund/${paymentId}`,
    { reason },
  );
  return response.data;
};

/**
 * Create invoice for payment
 */
export const createInvoice = async (
  payload: CreateInvoiceRequest,
): Promise<InvoiceResponse> => {
  const response = await apiClient.post<InvoiceResponse>('/invoices', payload);
  return response.data;
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (
  invoiceId: string,
): Promise<InvoiceResponse> => {
  const response = await apiClient.get<InvoiceResponse>(
    `/invoices/${invoiceId}`,
  );
  return response.data;
};

/**
 * Update invoice
 */
export const updateInvoice = async (
  invoiceId: string,
  payload: UpdateInvoiceRequest,
): Promise<InvoiceResponse> => {
  const response = await apiClient.patch<InvoiceResponse>(
    `/invoices/${invoiceId}`,
    payload,
  );
  return response.data;
};

/**
 * Get invoices by payment ID
 */
export const getInvoicesByPaymentId = async (
  paymentId: string,
): Promise<InvoiceResponse[]> => {
  const response = await apiClient.get<InvoiceResponse[]>(
    `/invoices/payment/${paymentId}`,
  );
  return response.data;
};

/**
 * Create receipt for invoice
 */
export const createReceipt = async (
  payload: CreateReceiptRequest,
): Promise<ReceiptResponse> => {
  const response = await apiClient.post<ReceiptResponse>('/receipts', payload);
  return response.data;
};

/**
 * Get receipt by ID
 */
export const getReceiptById = async (
  receiptId: string,
): Promise<ReceiptResponse> => {
  const response = await apiClient.get<ReceiptResponse>(
    `/receipts/${receiptId}`,
  );
  return response.data;
};

/**
 * Update receipt
 */
export const updateReceipt = async (
  receiptId: string,
  payload: UpdateReceiptRequest,
): Promise<ReceiptResponse> => {
  const response = await apiClient.patch<ReceiptResponse>(
    `/receipts/${receiptId}`,
    payload,
  );
  return response.data;
};

/**
 * Get receipts by invoice ID
 */
export const getReceiptsByInvoiceId = async (
  invoiceId: string,
): Promise<ReceiptResponse[]> => {
  const response = await apiClient.get<ReceiptResponse[]>(
    `/receipts/invoice/${invoiceId}`,
  );
  return response.data;
};
