import {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
  deleteReceipt,
  generateReceiptPDF,
  getReceiptStats,
  generateReceiptReport,
} from '@/services/receipt';

import type { ReceiptParams } from '@/types/receipt';
import type { ApiResponse } from '@/types/user';
import type { Receipt, ReceiptRequest } from '@/types/receipt';
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

/**
 * Hook to get all receipts with pagination
 */
export const useReceipts = (params: Partial<ReceiptParams> = {}) => {
  const { page = 1, limit = 10, ...queryParams } = params;
  return useQuery({
    queryKey: ['receipts', page, limit, queryParams],
    queryFn: () => getAllReceipts({ page, limit, ...queryParams }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnMount: true,
  });
};

/**
 * Hook to get a single receipt by ID
 */
export const useReceipt = (receiptId: string) => {
  return useQuery({
    queryKey: ['receipt', receiptId],
    queryFn: () => getReceiptById(receiptId),
    enabled: !!receiptId,
  });
};

/**
 * Hook to get receipt statistics
 */
export const useReceiptStats = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['receipt-stats', params],
    queryFn: () => getReceiptStats(params),
  });
};

/**
 * Mutation hook to create a receipt
 */
export const useCreateReceiptMutation = (
  options?: UseMutationOptions<
    ApiResponse<Receipt>,
    Error,
    ReceiptRequest,
    unknown
  >,
) => {
  return useMutation({
    mutationFn: createReceipt,
    ...options,
  });
};

/**
 * Mutation hook to update a receipt
 */
export const useUpdateReceiptMutation = (
  options?: UseMutationOptions<
    ApiResponse<Receipt>,
    Error,
    { receiptId: string; payload: Partial<ReceiptRequest> },
    unknown
  >,
) => {
  return useMutation({
    mutationFn: ({ receiptId, payload }) => updateReceipt(receiptId, payload),
    ...options,
  });
};

/**
 * Mutation hook to delete a receipt
 */
export const useDeleteReceiptMutation = (
  options?: UseMutationOptions<ApiResponse<void>, Error, string, unknown>,
) => {
  return useMutation({
    mutationFn: deleteReceipt,
    ...options,
  });
};

/**
 * Mutation hook to generate receipt PDF
 */
export const useGenerateReceiptPDFMutation = (
  options?: UseMutationOptions<Blob, Error, string, unknown>,
) => {
  return useMutation({
    mutationFn: generateReceiptPDF,
    ...options,
  });
};

/**
 * Mutation hook to generate receipt report
 */
export const useGenerateReceiptReportMutation = (
  options?: UseMutationOptions<
    Blob,
    Error,
    {
      format: 'pdf' | 'excel';
      startDate: string;
      endDate: string;
      status?: string;
    },
    unknown
  >,
) => {
  return useMutation({
    mutationFn: generateReceiptReport,
    ...options,
  });
};
