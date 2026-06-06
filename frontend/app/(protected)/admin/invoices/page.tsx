'use client';

import React, { useState } from 'react';
import DataTable from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useInvoices,
  useDeleteInvoiceMutation,
  useMarkInvoiceAsPaidMutation,
  useGenerateInvoicePDFMutation,
  useGenerateInvoiceReportMutation,
  useInvoiceStats,
} from '@/hooks/useInvoiceQueries';
import type { InvoiceResponse, InvoiceStatus } from '@/types/payment';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Plus,
  CheckCircle,
  FileText,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import InvoiceDetailsSheet from '@/components/sheets/InvoiceDetailsSheet';
import AddInvoiceDialog from '@/components/dialog/AddInvoiceDialog';
import EditInvoiceDialog from '@/components/dialog/EditInvoiceDialog';
import { formatToGMD } from '@/utils/helpers';
import { ReportGenerationDialog } from '@/components/dialog/ReportGenerationDialog';
import { ConfirmationAlertDialog } from '@/components/dialog/ConfirmationAlertDialog';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/permission';

const InvoicesPage = () => {
  // Permission checks
  const { hasPermission } = usePermissions();

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>(
    'ALL',
  );
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Dialog and sheet state
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceResponse | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Alert dialog state
  const [alertDialogState, setAlertDialogState] = useState<{
    isOpen: boolean;
    action: 'delete' | 'mark-paid' | null;
    invoice: InvoiceResponse | null;
  }>({
    isOpen: false,
    action: null,
    invoice: null,
  });

  // Build query params
  const queryParams = {
    page,
    limit: pageSize,
    ...(search && { search }),
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
    ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
  };

  const {
    data,
    isFetching: isLoading,
    error,
    refetch,
  } = useInvoices(queryParams);
  const invoices = data?.data ?? [];
  const pagination = data?.pagination;

  // Stats
  const { data: stats } = useInvoiceStats();

  // Mutations
  const deleteInvoiceMutation = useDeleteInvoiceMutation({
    onSuccess: () => {
      toast.success('Invoice deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to delete invoice');
    },
  });

  const markAsPaidMutation = useMarkInvoiceAsPaidMutation({
    onSuccess: () => {
      toast.success('Invoice marked as paid successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to mark invoice as paid');
    },
  });

  const generatePDFMutation = useGenerateInvoicePDFMutation({
    onSuccess: blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${selectedInvoice?._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to generate PDF');
    },
  });

  const generateReportMutation = useGenerateInvoiceReportMutation({
    onSuccess: blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-report-${new Date().toISOString()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to generate report');
    },
  });

  // Alert dialog handlers
  const openDeleteAlert = (invoice: InvoiceResponse) => {
    setAlertDialogState({
      isOpen: true,
      action: 'delete',
      invoice,
    });
  };

  const openMarkPaidAlert = (invoice: InvoiceResponse) => {
    setAlertDialogState({
      isOpen: true,
      action: 'mark-paid',
      invoice,
    });
  };

  const closeAlertDialog = () => {
    setAlertDialogState({
      isOpen: false,
      action: null,
      invoice: null,
    });
  };

  const handleAlertConfirm = () => {
    if (!alertDialogState.invoice) return;

    const { action, invoice } = alertDialogState;

    switch (action) {
      case 'delete':
        deleteInvoiceMutation.mutate(invoice._id);
        break;
      case 'mark-paid':
        markAsPaidMutation.mutate(invoice._id);
        break;
    }

    closeAlertDialog();
  };

  const getStatusBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: Array<{
    key?: keyof InvoiceResponse;
    title: string;
    width?: string;
    render?: (
      value: any,
      row?: InvoiceResponse,
      index?: number,
    ) => React.ReactNode;
  }> = [
    {
      title: '#No',
      width: '60px',
      render: (_: any, __: any, index?: number) => {
        const rowIndex = (index ?? 0) + 1 + (page - 1) * pageSize;
        const formattedIndex = rowIndex.toString().padStart(2, '0');
        return (
          <div className='text-start text-slate-600'>{formattedIndex}</div>
        );
      },
    },
    {
      key: 'invoiceNo',
      title: 'Invoice No',
      render: (value: string) => (
        <span className='font-mono text-sm font-medium'>{value}</span>
      ),
    },
    {
      title: 'Payment',
      render: (_: any, row?: InvoiceResponse) => {
        if (!row?.payment?._id)
          return <span className='text-gray-400'>N/A</span>;
        return (
          <div>
            <p className='text-sm font-medium'>Payment #{row.payment._id}</p>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      render: (_: any, row?: InvoiceResponse) => {
        if (!row) return null;
        const finalAmount = row.totalAmount + row.tax - row.discount;
        return (
          <div className='text-right'>
            <p className='font-semibold'>{formatToGMD(finalAmount)}</p>
            <p className='text-xs text-gray-500'>
              Total: {formatToGMD(row.totalAmount)}
            </p>
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: InvoiceStatus) => (
        <Badge className={getStatusBadgeVariant(value)}>{value}</Badge>
      ),
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      render: (value: string) => {
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue =
          dueDate < today &&
          !['PAID', 'CANCELLED'].includes(
            // This would need the row context, but for now just show the date
            'PAID',
          );
        return (
          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {dueDate.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'issuedAt',
      title: 'Issued',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Actions',
      width: '100px',
      render: (_: any, row?: InvoiceResponse) => {
        if (!row) return null;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-48 p-0' align='end'>
              <div className='py-1'>
                <button
                  className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                  onClick={() => {
                    setSelectedInvoice(row);
                    setIsDetailsSheetOpen(true);
                  }}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  View Details
                </button>
                {hasPermission('invoice:update') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                    onClick={() => {
                      setSelectedInvoice(row);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    Update Invoice
                  </button>
                )}
                {hasPermission('pdf:generate:invoice') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                    onClick={() => {
                      setSelectedInvoice(row);
                      generatePDFMutation.mutate(row._id);
                    }}
                    disabled={generatePDFMutation.isPending}
                  >
                    <Download className='mr-2 h-4 w-4' />
                    {generatePDFMutation.isPending
                      ? 'Downloading...'
                      : 'Download PDF'}
                  </button>
                )}
                {row.status === 'UNPAID' &&
                  hasPermission('payment:process') && (
                    <button
                      className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                      onClick={() => openMarkPaidAlert(row)}
                    >
                      <CheckCircle className='mr-2 h-4 w-4' />
                      Mark as Paid
                    </button>
                  )}
                {hasPermission('invoice:delete') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100'
                    onClick={() => openDeleteAlert(row)}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800'>
            Error loading invoices: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Total Invoices
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {stats?.totalInvoices ?? 0}
              </p>
            </div>
            <FileText className='h-8 w-8 text-blue-600' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Paid</p>
              <p className='text-2xl font-bold text-green-600'>
                {stats?.paidInvoices ?? 0}
              </p>
            </div>
            <CheckCircle className='h-8 w-8 text-green-600' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Unpaid</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {stats?.unpaidInvoices ?? 0}
              </p>
            </div>
            <FileText className='h-8 w-8 text-yellow-600' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Overdue</p>
              <p className='text-2xl font-bold text-red-600'>
                {stats?.overdueInvoices ?? 0}
              </p>
            </div>
            <FileText className='h-8 w-8 text-red-600' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
              <p className='text-2xl font-bold text-blue-600'>
                {stats?.totalRevenue
                  ? formatToGMD(stats.totalRevenue)
                  : 'D0.00'}
              </p>
            </div>
            <FileText className='h-8 w-8 text-blue-600' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Unpaid Amount</p>
              <p className='text-2xl font-bold text-orange-600'>
                {stats?.unpaidAmount
                  ? formatToGMD(stats.unpaidAmount)
                  : 'D0.00'}
              </p>
            </div>
            <FileText className='h-8 w-8 text-orange-600' />
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
        <div className='bg-white p-6 rounded-lg shadow'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>
            Monthly Revenue
          </h3>
          <div className='space-y-3'>
            {stats.monthlyRevenue.map((monthData, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='w-24 text-sm font-medium text-gray-600'>
                    {monthData.month}
                  </div>
                  <div className='flex-1'>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{
                          width: `${
                            stats.monthlyRevenue.length > 0
                              ? ((monthData.revenue || 0) /
                                  Math.max(
                                    ...stats.monthlyRevenue.map(
                                      m => m.revenue || 0,
                                    ),
                                  )) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-sm font-semibold text-gray-900'>
                    {formatToGMD(monthData.revenue || 0)}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {monthData.count || 0} invoices
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Invoices</h1>
          <p className='text-gray-600'>
            Manage and track all invoice transactions
          </p>
        </div>
        <div className='flex gap-3'>
          {hasPermission('reports:generate') && (
            <Button
              variant='outline'
              onClick={() => setIsReportDialogOpen(true)}
            >
              <FileText className='mr-2 h-4 w-4' />
              Generate Report
            </Button>
          )}
          {hasPermission('invoice:create') && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className='mr-2 h-4 w-4' />
              Add Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Search
            </label>
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search invoices...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Status
            </label>
            <Select
              value={statusFilter}
              onValueChange={(value: InvoiceStatus | 'ALL') =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Status</SelectItem>
                <SelectItem value='UNPAID'>Unpaid</SelectItem>
                <SelectItem value='PAID'>Paid</SelectItem>
                <SelectItem value='OVERDUE'>Overdue</SelectItem>
                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Start Date
            </label>
            <DatePicker
              date={startDate}
              onDateChange={setStartDate}
              placeholder='Select start date'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              End Date
            </label>
            <DatePicker
              date={endDate}
              onDateChange={setEndDate}
              placeholder='Select end date'
            />
          </div>
          <div className='flex items-end'>
            <Button
              variant='outline'
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setStartDate(undefined);
                setEndDate(undefined);
                setPage(1);
              }}
              className='w-full'
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        loading={isLoading}
        searchPlaceholder='Search invoices...'
        emptyMessage='No invoices found.'
        enableSorting
        enableFiltering
        enablePagination
        pageSize={pagination?.limit ?? 10}
        showButton
        onClick={() => setIsAddDialogOpen(true)}
        buttonTitle='Create New Invoice'
      />

      {/* Dialogs and Sheets */}
      <InvoiceDetailsSheet
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
        invoice={selectedInvoice}
        onDelete={_invoiceId => openDeleteAlert(selectedInvoice!)}
        onMarkAsPaid={_invoiceId => openMarkPaidAlert(selectedInvoice!)}
        onDownloadPDF={invoiceId => generatePDFMutation.mutate(invoiceId)}
      />

      <AddInvoiceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          refetch();
          setIsAddDialogOpen(false);
        }}
      />

      <EditInvoiceDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        invoice={selectedInvoice}
        onSuccess={() => {
          refetch();
          setIsEditDialogOpen(false);
        }}
      />

      {/* Report Generation Dialog */}
      <ReportGenerationDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onGenerate={generateReportMutation.mutate}
        isGenerating={generateReportMutation.isPending}
      />

      {/* Alert Dialog */}
      <ConfirmationAlertDialog
        isOpen={alertDialogState.isOpen}
        action={alertDialogState.action}
        onConfirm={handleAlertConfirm}
        onCancel={closeAlertDialog}
      />
    </div>
  );
};

export default InvoicesPage;
