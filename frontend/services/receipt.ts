import type { ApiResponse } from '@/types/user';
import type {
  Receipt,
  ReceiptRequest,
  ReceiptParams,
  ReceiptStats,
} from '@/types/receipt';
import apiClient from '@/utils/api-client';

/**
 * Create a new receipt
 */
export const createReceipt = async (
  payload: ReceiptRequest,
): Promise<ApiResponse<Receipt>> => {
  const response = await apiClient.post<ApiResponse<Receipt>>(
    '/receipts/create',
    payload,
  );
  return response.data;
};

/**
 * Get all receipts with pagination and filters
 */
export const getAllReceipts = async (
  params: Partial<ReceiptParams> = {},
): Promise<ApiResponse<Receipt[]>> => {
  const response = await apiClient.get<ApiResponse<Receipt[]>>(
    '/receipts/getAll',
    { params },
  );
  return response.data;
};

/**
 * Get a single receipt by ID
 */
export const getReceiptById = async (receiptId: string): Promise<Receipt> => {
  const response = await apiClient.get<Receipt>(`/receipts/get/${receiptId}`);
  return response.data;
};

/**
 * Update a receipt by ID
 */
export const updateReceipt = async (
  receiptId: string,
  payload: Partial<ReceiptRequest>,
): Promise<ApiResponse<Receipt>> => {
  const response = await apiClient.put<ApiResponse<Receipt>>(
    `/receipts/update/${receiptId}`,
    payload,
  );
  return response.data;
};

/**
 * Delete a receipt by ID
 */
export const deleteReceipt = async (
  receiptId: string,
): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/receipts/delete/${receiptId}`,
  );
  return response.data;
};

/**
 * Generate PDF for a receipt
 */
export const generateReceiptPDF = async (receiptId: string): Promise<Blob> => {
  const response = await apiClient.get(`/receipts/pdf/${receiptId}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get receipt statistics
 */
export const getReceiptStats = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ReceiptStats> => {
  const response = await apiClient.get<ReceiptStats>('/receipts/stats', {
    params,
  });
  return response.data;
};

/**
 * Generate receipt report
 */
export const generateReceiptReport = async (params: {
  format: 'pdf' | 'excel';
  startDate: string;
  endDate: string;
  status?: string;
}): Promise<Blob> => {
  const response = await apiClient.get('/receipts/report', {
    params,
    responseType: 'blob',
  });
  return response.data;
};
