import type { ApiResponse } from '@/types/user';
import type {
  InvoiceResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from '@/types/payment';
import type { InvoiceQueryParams, InvoiceStats } from '@/types/invoice';
import apiClient from '@/utils/api-client';

/**
 * Create a new invoice
 */
export const createInvoice = async (
  payload: CreateInvoiceRequest,
): Promise<ApiResponse<InvoiceResponse>> => {
  const response = await apiClient.post<ApiResponse<InvoiceResponse>>(
    '/invoices/create',
    payload,
  );
  return response.data;
};

/**
 * Get all invoices with pagination and filters
 */
export const getAllInvoices = async (
  params: Partial<InvoiceQueryParams> = {},
): Promise<ApiResponse<InvoiceResponse[]>> => {
  const response = await apiClient.get<ApiResponse<InvoiceResponse[]>>(
    '/invoices/getAll',
    { params },
  );
  return response.data;
};

/**
 * Get a single invoice by ID
 */
export const getInvoiceById = async (
  invoiceId: string,
): Promise<InvoiceResponse> => {
  const response = await apiClient.get<InvoiceResponse>(
    `/invoices/get/${invoiceId}`,
  );
  return response.data;
};

/**
 * Update an invoice by ID
 */
export const updateInvoice = async (
  invoiceId: string,
  payload: UpdateInvoiceRequest,
): Promise<ApiResponse<InvoiceResponse>> => {
  const response = await apiClient.put<ApiResponse<InvoiceResponse>>(
    `/invoices/update/${invoiceId}`,
    payload,
  );
  return response.data;
};

/**
 * Delete an invoice by ID
 */
export const deleteInvoice = async (
  invoiceId: string,
): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/invoices/delete/${invoiceId}`,
  );
  return response.data;
};

/**
 * Mark an invoice as paid
 */
export const markInvoiceAsPaid = async (
  invoiceId: string,
): Promise<ApiResponse<InvoiceResponse>> => {
  const response = await apiClient.patch<ApiResponse<InvoiceResponse>>(
    `/invoices/mark-paid/${invoiceId}`,
  );
  return response.data;
};

/**
 * Generate PDF for an invoice
 */
export const generateInvoicePDF = async (invoiceId: string): Promise<Blob> => {
  const response = await apiClient.get(`/invoices/pdf/${invoiceId}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get invoice statistics
 */
export const getInvoiceStats = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<InvoiceStats> => {
  const response = await apiClient.get<InvoiceStats>('/invoices/stats', {
    params,
  });
  return response.data;
};

/**
 * Get overdue invoices
 */
export const getOverdueInvoices = async (
  params: Partial<InvoiceQueryParams> = {},
): Promise<ApiResponse<InvoiceResponse[]>> => {
  const response = await apiClient.get<ApiResponse<InvoiceResponse[]>>(
    '/invoices/overdue',
    { params },
  );
  return response.data;
};

/**
 * Generate invoice report
 */
export const generateInvoiceReport = async (params: {
  format: 'pdf' | 'excel';
  startDate: string;
  endDate: string;
  status?: string;
}): Promise<Blob> => {
  const response = await apiClient.get('/invoices/report', {
    params,
    responseType: 'blob',
  });
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
