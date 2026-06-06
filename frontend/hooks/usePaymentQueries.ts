import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentsByBookingId,
  processPayment,
  refundPayment,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  getInvoicesByPaymentId,
  createReceipt,
  getReceiptById,
  updateReceipt,
  getReceiptsByInvoiceId,
  updatePaymentStatus,
} from '@/services/payment';
import type { ApiResponse, PaginationParams } from '@/types/user';
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
import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

/**
 * Hook to get all payments with pagination
 */
export const usePayments = (params: PaymentQueryParams = {}) => {
  const { page = 1, limit = 10, ...queryParams } = params;
  return useQuery({
    queryKey: ['payments', page, limit, queryParams],
    queryFn: () => getAllPayments({ page, limit, ...queryParams }),
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to get a single payment by ID
 */
export const usePayment = (paymentId: number) => {
  return useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => getPaymentById(paymentId),
    enabled: !!paymentId,
  });
};

/**
 * Hook to get payments by booking ID
 */
export const usePaymentsByBookingId = (bookingId: number) => {
  return useQuery({
    queryKey: ['payments', 'booking', bookingId],
    queryFn: () => getPaymentsByBookingId(bookingId),
    enabled: !!bookingId,
  });
};

/**
 * Mutation hook to create a payment
 */
export const useCreatePaymentMutation = (
  options?: UseMutationOptions<
    PaymentApiResponse,
    unknown,
    CreatePaymentRequest,
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['create-payment'],
    mutationFn: createPayment,
    ...options,
  });
};

/**
 * Mutation hook to update a payment
 */
export const useUpdatePaymentMutation = (
  options?: UseMutationOptions<
    PaymentResponse,
    unknown,
    { paymentId: number; data: UpdatePaymentRequest },
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['update-payment'],
    mutationFn: async ({
      paymentId,
      data,
    }: {
      paymentId: number;
      data: UpdatePaymentRequest;
    }) => {
      return updatePayment(paymentId, data);
    },
    ...options,
  });
};

/**
 * Mutation hook to delete a payment
 */
export const useDeletePaymentMutation = (
  options?: UseMutationOptions<{ message: string }, unknown, number, unknown>,
) => {
  return useMutation({
    mutationKey: ['delete-payment'],
    mutationFn: deletePayment,
    ...options,
  });
};

/**
 * Mutation hook to process a payment
 */
export const useProcessPaymentMutation = (
  options?: UseMutationOptions<PaymentResponse, unknown, number, unknown>,
) => {
  return useMutation({
    mutationKey: ['process-payment'],
    mutationFn: processPayment,
    ...options,
  });
};

/**
 * Mutation hook to process a payment
 */
export const useUpdatePaymentStatusMutation = (
  options?: UseMutationOptions<PaymentResponse, unknown, number, unknown>,
) => {
  return useMutation({
    mutationKey: ['update-payment-status'],
    mutationFn: updatePaymentStatus,
    ...options,
  });
};

/**
 * Mutation hook to refund a payment
 */
export const useRefundPaymentMutation = (
  options?: UseMutationOptions<
    PaymentResponse,
    unknown,
    { paymentId: number; reason?: string },
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['refund-payment'],
    mutationFn: async ({
      paymentId,
      reason,
    }: {
      paymentId: number;
      reason?: string;
    }) => {
      return refundPayment(paymentId, reason);
    },
    ...options,
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
 * Mutation hook to create an invoice
 */
export const useCreateInvoiceMutation = (
  options?: UseMutationOptions<
    InvoiceResponse,
    unknown,
    CreateInvoiceRequest,
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['create-invoice'],
    mutationFn: createInvoice,
    ...options,
  });
};

/**
 * Mutation hook to update an invoice
 */
export const useUpdateInvoiceMutation = (
  options?: UseMutationOptions<
    InvoiceResponse,
    unknown,
    { invoiceId: number; data: UpdateInvoiceRequest },
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['update-invoice'],
    mutationFn: async ({
      invoiceId,
      data,
    }: {
      invoiceId: number;
      data: UpdateInvoiceRequest;
    }) => {
      return updateInvoice(invoiceId, data);
    },
    ...options,
  });
};

/**
 * Hook to get a single receipt by ID
 */
export const useReceipt = (receiptId: number) => {
  return useQuery({
    queryKey: ['receipt', receiptId],
    queryFn: () => getReceiptById(receiptId),
    enabled: !!receiptId,
  });
};

/**
 * Hook to get receipts by invoice ID
 */
export const useReceiptsByInvoiceId = (invoiceId: number) => {
  return useQuery({
    queryKey: ['receipts', 'invoice', invoiceId],
    queryFn: () => getReceiptsByInvoiceId(invoiceId),
    enabled: !!invoiceId,
  });
};

/**
 * Mutation hook to create a receipt
 */
export const useCreateReceiptMutation = (
  options?: UseMutationOptions<
    ReceiptResponse,
    unknown,
    CreateReceiptRequest,
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['create-receipt'],
    mutationFn: createReceipt,
    ...options,
  });
};

/**
 * Mutation hook to update a receipt
 */
export const useUpdateReceiptMutation = (
  options?: UseMutationOptions<
    ReceiptResponse,
    unknown,
    { receiptId: number; data: UpdateReceiptRequest },
    unknown
  >,
) => {
  return useMutation({
    mutationKey: ['update-receipt'],
    mutationFn: async ({
      receiptId,
      data,
    }: {
      receiptId: number;
      data: UpdateReceiptRequest;
    }) => {
      return updateReceipt(receiptId, data);
    },
    ...options,
  });
};
