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
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

export const useInvoices = (params: Partial<InvoiceQueryParams> = {}) => {
  const { page = 1, limit = 10, ...queryParams } = params;
  return useQuery({
    queryKey: ['invoices', page, limit, queryParams],
    queryFn: () => getAllInvoices({ page, limit, ...queryParams }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnMount: true,
  });
};

export const useInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => getInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 30_000,
  });
};

export const useInvoicesByPaymentId = (paymentId: string) => {
  return useQuery({
    queryKey: ['invoices', 'payment', paymentId],
    queryFn: () => getInvoicesByPaymentId(paymentId),
    enabled: !!paymentId,
    staleTime: 30_000,
  });
};

export const useInvoiceStats = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['invoice-stats', params],
    queryFn: () => getInvoiceStats(params),
    staleTime: 60_000,
  });
};

export const useOverdueInvoices = (
  params: Partial<InvoiceQueryParams> = {},
) => {
  const { page = 1, limit = 10, ...queryParams } = params;
  return useQuery({
    queryKey: ['invoices', 'overdue', page, limit, queryParams],
    queryFn: () => getOverdueInvoices({ page, limit, ...queryParams }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const useCreateInvoiceMutation = (
  options?: UseMutationOptions<
    ApiResponse<InvoiceResponse>,
    Error,
    CreateInvoiceRequest
  >,
) => {
  return useMutation<ApiResponse<InvoiceResponse>, Error, CreateInvoiceRequest>(
    {
      mutationFn: createInvoice,
      ...options,
    },
  );
};

export const useUpdateInvoiceMutation = (
  options?: UseMutationOptions<
    ApiResponse<InvoiceResponse>,
    Error,
    { invoiceId: string; data: UpdateInvoiceRequest }
  >,
) => {
  return useMutation<
    ApiResponse<InvoiceResponse>,
    Error,
    { invoiceId: string; data: UpdateInvoiceRequest }
  >({
    mutationFn: ({ invoiceId, data }) => updateInvoice(invoiceId, data),
    ...options,
  });
};

export const useDeleteInvoiceMutation = (
  options?: UseMutationOptions<ApiResponse<void>, Error, string>,
) => {
  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: deleteInvoice,
    ...options,
  });
};

export const useMarkInvoiceAsPaidMutation = (
  options?: UseMutationOptions<ApiResponse<InvoiceResponse>, Error, string>,
) => {
  return useMutation<ApiResponse<InvoiceResponse>, Error, string>({
    mutationFn: markInvoiceAsPaid,
    ...options,
  });
};

export const useGenerateInvoicePDFMutation = (
  options?: UseMutationOptions<Blob, Error, string>,
) => {
  return useMutation<Blob, Error, string>({
    mutationFn: generateInvoicePDF,
    ...options,
  });
};

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

export const useInvalidateInvoices = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['invoice-stats'] });
  };
};
