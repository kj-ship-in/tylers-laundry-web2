'use client';

import React, { useEffect, useState } from 'react';
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
  useInvalidateInvoices,
} from '@/hooks/useInvoiceQueries';
import type { InvoiceResponse, InvoiceStatus } from '@/types/payment';
import type { Column } from '@/types/table';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Plus,
  CheckCircle,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
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
import { usePermissions } from '@/hooks/usePermissions';

const STATUS_BADGE: Record<InvoiceStatus, string> = {
  PAID: 'bg-green-100 text-green-800 hover:bg-green-100',
  UNPAID: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-100',
  OVERDUE: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
};

const InvoicesPage = () => {
  const { hasPermission } = usePermissions();
  const invalidateInvoices = useInvalidateInvoices();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>(
    'ALL',
  );
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceResponse | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [alertDialogState, setAlertDialogState] = useState<{
    isOpen: boolean;
    action: 'delete' | 'mark-paid' | null;
    invoice: InvoiceResponse | null;
  }>({ isOpen: false, action: null, invoice: null });

  // Debounce search input — reset to page 1 on new search
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const queryParams = {
    page,
    limit: pageSize,
    ...(search && { search }),
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
    ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
  };

  const { data, isLoading, isFetching, error } = useInvoices(queryParams);
  const { data: stats } = useInvoiceStats();

  const invoices = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  const deleteInvoiceMutation = useDeleteInvoiceMutation({
    onSuccess: () => {
      toast.success('Invoice deleted successfully');
      invalidateInvoices();
    },
    onError: (error: any) =>
      toast.error(error.message ?? 'Failed to delete invoice'),
  });

  const markAsPaidMutation = useMarkInvoiceAsPaidMutation({
    onSuccess: () => {
      toast.success('Invoice marked as paid successfully');
      invalidateInvoices();
    },
    onError: (error: any) =>
      toast.error(error.message ?? 'Failed to mark invoice as paid'),
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
    onError: (error: any) =>
      toast.error(error.message ?? 'Failed to generate PDF'),
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
    onError: (error: any) =>
      toast.error(error.message ?? 'Failed to generate report'),
  });

  const openDeleteAlert = (invoice: InvoiceResponse) =>
    setAlertDialogState({ isOpen: true, action: 'delete', invoice });
  const openMarkPaidAlert = (invoice: InvoiceResponse) =>
    setAlertDialogState({ isOpen: true, action: 'mark-paid', invoice });
  const closeAlertDialog = () =>
    setAlertDialogState({ isOpen: false, action: null, invoice: null });

  const handleAlertConfirm = () => {
    if (!alertDialogState.invoice) return;
    if (alertDialogState.action === 'delete')
      deleteInvoiceMutation.mutate(alertDialogState.invoice._id);
    else if (alertDialogState.action === 'mark-paid')
      markAsPaidMutation.mutate(alertDialogState.invoice._id);
    closeAlertDialog();
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setStatusFilter('ALL');
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const columns: Column<InvoiceResponse>[] = [
    {
      title: '#',
      width: '48px',
      render: (_: any, __: any, index?: number) => (
        <span className='text-sm text-slate-500'>
          {((index ?? 0) + 1 + (page - 1) * pageSize)
            .toString()
            .padStart(2, '0')}
        </span>
      ),
    },
    {
      title: 'Invoice',
      render: (_: any, row?: InvoiceResponse) => {
        if (!row) return null;
        const customer = row.payment?.booking?.user;
        return (
          <div className='space-y-0.5 min-w-0'>
            <p className='font-mono text-sm font-semibold text-gray-900'>
              {row.invoiceNo}
            </p>
            {customer && (
              <p className='text-xs text-gray-500 truncate'>{customer.name}</p>
            )}
          </div>
        );
      },
    },
    {
      title: 'Service',
      className: 'hidden sm:table-cell',
      render: (_: any, row?: InvoiceResponse) => {
        const service = row?.payment?.booking?.service;
        if (!service) return <span className='text-gray-400 text-sm'>—</span>;
        return (
          <div className='min-w-0'>
            <p className='text-sm text-gray-800 truncate'>{service.title}</p>
            <p className='text-xs text-gray-400'>{service.type}</p>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      render: (_: any, row?: InvoiceResponse) => {
        if (!row) return null;
        const net = row.totalAmount + row.tax - row.discount;
        return (
          <div>
            <p className='font-semibold text-gray-900 whitespace-nowrap'>
              {formatToGMD(net)}
            </p>
            {(row.tax > 0 || row.discount > 0) && (
              <p className='text-xs text-gray-400 whitespace-nowrap'>
                {row.tax > 0 && `+${formatToGMD(row.tax)} tax`}
                {row.discount > 0 && ` -${formatToGMD(row.discount)}`}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: InvoiceStatus) => (
        <Badge className={STATUS_BADGE[value] ?? 'bg-gray-100 text-gray-800'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'dueDate',
      title: 'Due',
      className: 'hidden md:table-cell',
      render: (value: string, row?: InvoiceResponse) => {
        const dueDate = new Date(value);
        const isOverdue = dueDate < new Date() && row?.status === 'UNPAID';
        return (
          <span
            className={`text-sm whitespace-nowrap ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}
          >
            {dueDate.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      width: '56px',
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
                  <Eye className='mr-2 h-4 w-4' /> View Details
                </button>
                {hasPermission('invoice:update') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                    onClick={() => {
                      setSelectedInvoice(row);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <FileText className='mr-2 h-4 w-4' /> Update Invoice
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
                      <CheckCircle className='mr-2 h-4 w-4' /> Mark as Paid
                    </button>
                  )}
                {hasPermission('invoice:delete') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                    onClick={() => openDeleteAlert(row)}
                  >
                    <Trash2 className='mr-2 h-4 w-4' /> Delete
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
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
        {[
          {
            label: 'Total',
            value: stats?.totalInvoices ?? 0,
            color: 'text-blue-600',
            icon: <FileText className='h-6 w-6 text-blue-500' />,
          },
          {
            label: 'Paid',
            value: stats?.paidInvoices ?? 0,
            color: 'text-green-600',
            icon: <CheckCircle className='h-6 w-6 text-green-500' />,
          },
          {
            label: 'Unpaid',
            value: stats?.unpaidInvoices ?? 0,
            color: 'text-yellow-600',
            icon: <FileText className='h-6 w-6 text-yellow-500' />,
          },
          {
            label: 'Overdue',
            value: stats?.overdueInvoices ?? 0,
            color: 'text-red-600',
            icon: <FileText className='h-6 w-6 text-red-500' />,
          },
          {
            label: 'Revenue',
            value: stats?.totalRevenue
              ? formatToGMD(stats.totalRevenue)
              : 'D0.00',
            color: 'text-blue-700',
            icon: <FileText className='h-6 w-6 text-blue-600' />,
          },
          {
            label: 'Unpaid Amt',
            value: stats?.unpaidAmount
              ? formatToGMD(stats.unpaidAmount)
              : 'D0.00',
            color: 'text-orange-600',
            icon: <FileText className='h-6 w-6 text-orange-500' />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className='bg-white p-3 rounded-lg border border-gray-200 shadow-sm'
          >
            <div className='flex items-center justify-between mb-1'>
              <p className='text-xs font-medium text-gray-500'>{stat.label}</p>
              {stat.icon}
            </div>
            <p className={`text-lg font-bold ${stat.color} truncate`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue */}
      {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
        <div className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm'>
          <h3 className='text-sm font-semibold text-gray-700 mb-3'>
            Monthly Revenue
          </h3>
          <div className='space-y-2'>
            {stats.monthlyRevenue.map((monthData, index) => {
              const max = Math.max(
                ...stats.monthlyRevenue.map(m => m.revenue || 0),
              );
              const pct = max > 0 ? ((monthData.revenue || 0) / max) * 100 : 0;
              return (
                <div key={index} className='flex items-center gap-3'>
                  <span className='text-xs text-gray-500 w-20 shrink-0'>
                    {monthData.month}
                  </span>
                  <div className='flex-1 bg-gray-100 rounded-full h-1.5'>
                    <div
                      className='bg-blue-500 h-1.5 rounded-full'
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className='text-right shrink-0'>
                    <span className='text-xs font-medium text-gray-800'>
                      {formatToGMD(monthData.revenue || 0)}
                    </span>
                    <span className='text-xs text-gray-400 ml-1'>
                      ({monthData.count})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-gray-900'>Invoices</h1>
          <p className='text-sm text-gray-500'>
            Manage and track all invoice transactions
          </p>
        </div>
        <div className='flex gap-2'>
          {hasPermission('reports:generate') && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsReportDialogOpen(true)}
            >
              <FileText className='mr-1.5 h-4 w-4' /> Report
            </Button>
          )}
          {hasPermission('invoice:create') && (
            <Button size='sm' onClick={() => setIsAddDialogOpen(true)}>
              <Plus className='mr-1.5 h-4 w-4' /> Add Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white p-3 rounded-lg border border-gray-200'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3'>
          <input
            type='text'
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder='Search invoices...'
            className='px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <Select
            value={statusFilter}
            onValueChange={(v: InvoiceStatus | 'ALL') => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className='text-sm'>
              <SelectValue placeholder='All Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Status</SelectItem>
              <SelectItem value='UNPAID'>Unpaid</SelectItem>
              <SelectItem value='PAID'>Paid</SelectItem>
              <SelectItem value='OVERDUE'>Overdue</SelectItem>
              <SelectItem value='CANCELLED'>Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <DatePicker
            date={startDate}
            onDateChange={d => {
              setStartDate(d);
              setPage(1);
            }}
            placeholder='Start date'
          />
          <DatePicker
            date={endDate}
            onDateChange={d => {
              setEndDate(d);
              setPage(1);
            }}
            placeholder='End date'
          />
          <Button
            variant='outline'
            size='sm'
            onClick={clearFilters}
            className='h-9'
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Table with fetching indicator */}
      <div className='relative'>
        {isFetching && !isLoading && (
          <div className='absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm text-xs text-gray-500'>
            <Loader2 className='h-3 w-3 animate-spin' /> Updating...
          </div>
        )}
        <DataTable
          columns={columns}
          data={invoices}
          loading={isLoading}
          emptyMessage='No invoices found.'
          enableSorting={false}
          enableFiltering={false}
          enablePagination={false}
        />
      </div>

      {/* Server-side pagination */}
      {pagination && pagination.total > 0 && (
        <div className='flex items-center justify-between px-2'>
          <p className='text-sm text-gray-500'>
            Showing {(page - 1) * pageSize + 1}–
            {Math.min(page * pageSize, pagination.total)} of {pagination.total}
          </p>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='px-2 text-sm text-gray-600'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      <InvoiceDetailsSheet
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
        invoice={selectedInvoice}
        onDelete={_id => openDeleteAlert(selectedInvoice!)}
        onMarkAsPaid={_id => openMarkPaidAlert(selectedInvoice!)}
        onDownloadPDF={id => generatePDFMutation.mutate(id)}
      />
      <AddInvoiceDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          invalidateInvoices();
          setIsAddDialogOpen(false);
        }}
      />
      <EditInvoiceDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        invoice={selectedInvoice}
        onSuccess={() => {
          invalidateInvoices();
          setIsEditDialogOpen(false);
        }}
      />
      <ReportGenerationDialog
        isOpen={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        onGenerate={generateReportMutation.mutate}
        isGenerating={generateReportMutation.isPending}
      />
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
