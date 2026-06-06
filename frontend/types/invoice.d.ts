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

export interface InvoiceQueryParams {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
}
