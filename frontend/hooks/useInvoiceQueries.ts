import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  markInvoiceAsPaid,
  generateInvoicePDF,
  getInvoiceStats,
  getOverdueInvoices,
  generateInvoiceReport,
  getInvoicesByPaymentId,
} from '@/services/invoice';

import type { InvoiceQueryParams } from '@/types/invoice';
import type { ApiResponse } from '@/types/user';
import type {
  InvoiceResponse,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from '@/types/payment';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

/**
 * Hook to get all invoices with pagination
 */
export const useInvoices = (params: Partial<InvoiceQueryParams> = {}) => {
  const { page = 1, limit = 10, ...queryParams } = params;
  return useQuery({
    queryKey: ['invoices', page, limit, queryParams],
    queryFn: () => getAllInvoices({ page, limit, ...queryParams }),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to get a single invoice by ID
 */
export const useInvoice = (invoiceId: number) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => getInvoiceById(invoiceId),
    enabled: !!invoiceId,
  });
};

/**
 * Hook to get invoices by payment ID
 */
export const useInvoicesByPaymentId = (paymentId: number) => {
  return useQuery({
    queryKey: ['invoices', 'payment', paymentId],
    queryFn: () => getInvoicesByPaymentId(paymentId),
    enabled: !!paymentId,
  });
};

/**
 * Hook to get invoice statistics
 */
export const useInvoiceStats = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['invoice-stats', params],
    queryFn: () => getInvoiceStats(params),
  });
};

/**
 * Hook to get overdue invoices
 */
export const useOverdueInvoices = (
  params: Partial<InvoiceQueryParams> = {},
) => {
  const { page = 1, limit = 10, ...queryParams } = params;
  return useQuery({
    queryKey: ['invoices', 'overdue', page, limit, queryParams],
    queryFn: () => getOverdueInvoices({ page, limit, ...queryParams }),
    placeholderData: keepPreviousData,
  });
};

/**
 * Mutation hook to create an invoice
 */
export const useCreateInvoiceMutation = (
  options?: UseMutationOptions<
    ApiResponse<InvoiceResponse>,
    Error,
    CreateInvoiceRequest
  >,
) => {
  return useMutation({
    mutationFn: createInvoice,
    ...options,
  });
};

/**
 * Mutation hook to update an invoice
 */
export const useUpdateInvoiceMutation = (
  options?: UseMutationOptions<
    ApiResponse<InvoiceResponse>,
    Error,
    { invoiceId: number; data: UpdateInvoiceRequest }
  >,
) => {
  return useMutation({
    mutationFn: ({ invoiceId, data }) => updateInvoice(invoiceId, data),
    ...options,
  });
};

/**
 * Mutation hook to delete an invoice
 */
export const useDeleteInvoiceMutation = (
  options?: UseMutationOptions<ApiResponse<void>, Error, number>,
) => {
  return useMutation({
    mutationFn: deleteInvoice,
    ...options,
  });
};

/**
 * Mutation hook to mark invoice as paid
 */
export const useMarkInvoiceAsPaidMutation = (
  options?: UseMutationOptions<ApiResponse<InvoiceResponse>, Error, number>,
) => {
  return useMutation({
    mutationFn: markInvoiceAsPaid,
    ...options,
  });
};

/**
 * Mutation hook to generate invoice PDF
 */
export const useGenerateInvoicePDFMutation = (
  options?: UseMutationOptions<Blob, Error, number>,
) => {
  return useMutation({
    mutationFn: generateInvoicePDF,
    ...options,
  });
};

/**
 * Mutation hook to generate invoice report
 */
export const useGenerateInvoiceReportMutation = (
  options?: UseMutationOptions<
    Blob,
    Error,
    {
      format: 'pdf' | 'excel';
      startDate: string;
      endDate: string;
      status?: string;
    }
  >,
) => {
  return useMutation({
    mutationFn: generateInvoiceReport,
    ...options,
  });
};
