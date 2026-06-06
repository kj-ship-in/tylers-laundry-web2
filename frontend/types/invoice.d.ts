import { status } from './../node_modules/next-auth/client/__tests__/helpers/mocks.d';
export interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  unpaidAmount: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    count: number;
  }>;
}

export interface InvoiceStats {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  status?: string;
  search?: string;
}

export interface InvoiceQueryParams extends PaginationParams {
  page: number;
  limit: number;
  startDate: string;
  endDate: string;
  status?: string;
  search?: string;
}
