'use client';

import { useState } from 'react';
import DataTable from '@/components/table/DataTable';
import { Button } from '@/components/ui/button';
import {
  useReceipts,
  useDeleteReceiptMutation,
  useGenerateReceiptPDFMutation,
  useGenerateReceiptReportMutation,
  useReceiptStats,
} from '@/hooks/useReceiptQueries';
import type { Receipt, ReceiptParams } from '@/types/receipt';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, Trash2, FileText, Download } from 'lucide-react';
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
import { formatToGMD } from '@/utils/helpers';
import { ReportGenerationDialog } from '@/components/dialog/ReportGenerationDialog';
import { ConfirmationAlertDialog } from '@/components/dialog/ConfirmationAlertDialog';
import ReceiptDetailsSheet from '@/components/sheets/ReceiptDetailsSheet';
import AddReceiptDialog from '@/components/dialog/AddReceiptDialog';
import EditReceiptDialog from '@/components/dialog/EditReceiptDialog';
import { DatePicker } from '@/components/ui/date-picker';
import { usePermissions } from '@/hooks/usePermissions';

const ReceiptsPage = () => {
  // Permission checks
  const { hasPermission } = usePermissions();

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Dialog states
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  // Mutations
  const deleteReceiptMutation = useDeleteReceiptMutation({
    onSuccess: () => {
      toast.success('Receipt deleted successfully');
      setShowDeleteDialog(false);
    },
    onError: error => {
      toast.error('Failed to delete receipt');
      console.error('Delete receipt error:', error);
    },
  });

  const generatePDFMutation = useGenerateReceiptPDFMutation({
    onSuccess: blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${selectedReceipt?.receiptNo ?? Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Receipt PDF downloaded successfully');
    },
    onError: error => {
      toast.error('Failed to generate PDF');
      console.error('Generate PDF error:', error);
    },
  });

  const generateReportMutation = useGenerateReceiptReportMutation({
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipts-report.${variables.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report generated successfully');
      setShowReportDialog(false);
    },
    onError: error => {
      toast.error('Failed to generate report');
      console.error('Generate report error:', error);
    },
  });

  // Query parameters
  const queryParams: Partial<ReceiptParams> = {
    page,
    limit: pageSize,
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    status: status !== 'all' ? status : undefined,
    search: search || undefined,
  };

  // Queries
  const { data: receiptsData, isLoading: isFetching } =
    useReceipts(queryParams);
  const { data: stats, isLoading: statsLoading } = useReceiptStats();

  const receipts = receiptsData?.data ?? [];
  const pagination = receiptsData?.pagination;

  // Handle actions
  const handleViewDetails = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowDetailsSheet(true);
  };

  const handleEdit = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowEditDialog(true);
  };

  const handleDelete = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedReceipt) {
      deleteReceiptMutation.mutate(selectedReceipt._id);
    }
  };

  const handleGeneratePDF = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    generatePDFMutation.mutate(receipt._id);
  };

  const handleGenerateReport = (params: {
    format: 'pdf' | 'excel';
    startDate: string;
    endDate: string;
  }) => {
    generateReportMutation.mutate(params);
  };

  // Table columns
  const columns: Array<{
    key?: keyof Receipt;
    title: string;
    render?: (value: any, row?: Receipt, index?: number) => React.ReactNode;
  }> = [
    {
      key: 'receiptNo',
      title: 'Receipt No',
      render: (value: string) => (
        <div className='font-medium text-gray-900'>{value}</div>
      ),
    },
    {
      title: 'Invoice',
      render: (_: any, row?: Receipt) => (
        <div className='text-sm text-gray-600'>
          #{row?.invoice?._id ?? '—'} -{' '}
          {formatToGMD(row?.invoice?.totalAmount ?? 0)}
        </div>
      ),
    },
    {
      key: 'issuedAt',
      title: 'Issued Date',
      render: (value: string) => (
        <div className='text-sm text-gray-600'>
          {format(new Date(value), 'MMM dd, yyyy')}
        </div>
      ),
    },
    {
      key: 'receivedBy',
      title: 'Received By',
      render: (value: string) => (
        <div className='text-sm text-gray-600'>{value || 'N/A'}</div>
      ),
    },
    {
      title: 'Amount',
      render: (_: any, row?: Receipt) => (
        <div className='font-medium text-green-600'>
          {formatToGMD(row?.invoice?.totalAmount ?? 0)}
        </div>
      ),
    },
    {
      title: 'Actions',
      render: (_: any, row?: Receipt) => {
        if (!row) return null;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-48'>
              <div className='space-y-1'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full justify-start'
                  onClick={() => handleViewDetails(row)}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  View Details
                </Button>
                {hasPermission('receipt:generate') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => handleGeneratePDF(row)}
                    disabled={generatePDFMutation.isPending}
                  >
                    <Download className='mr-2 h-4 w-4' />
                    Download PDF
                  </Button>
                )}
                {hasPermission('receipt:update') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => handleEdit(row)}
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    Edit
                  </Button>
                )}
                {hasPermission('receipt:delete') && (
                  <Button
                    variant='destructive'
                    size='sm'
                    className='w-full justify-start'
                    onClick={() => handleDelete(row)}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Receipts</h1>
          <p className='text-sm text-gray-600'>Manage and track all receipts</p>
        </div>
        <div className='flex gap-3'>
          {hasPermission('reports:generate') && (
            <Button variant='outline' onClick={() => setShowReportDialog(true)}>
              <FileText className='mr-2 h-4 w-4' />
              Generate Report
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>
                Total Receipts
              </p>
              <p className='text-2xl font-bold text-gray-900'>
                {statsLoading ? '...' : (stats?.totalReceipts ?? 0)}
              </p>
            </div>
            <FileText className='h-8 w-8 text-blue-600' />
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Total Value</p>
              <p className='text-2xl font-bold text-gray-900'>
                {statsLoading ? '...' : formatToGMD(stats?.totalValue ?? 0)}
              </p>
            </div>
            <FileText className='h-8 w-8 text-green-600' />
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>This Month</p>
              <p className='text-2xl font-bold text-gray-900'>
                {statsLoading ? '...' : (stats?.thisMonth ?? 0)}
              </p>
            </div>
            <FileText className='h-8 w-8 text-orange-600' />
          </div>
        </div>
        <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-600'>Growth</p>
              <p className='text-2xl font-bold text-gray-900'>
                {statsLoading ? '...' : `${stats?.growth ?? 0}%`}
              </p>
            </div>
            <FileText className='h-8 w-8 text-purple-600' />
          </div>
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
              placeholder='Search receipts...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
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
                setStatus('all');
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={receipts}
        loading={isFetching}
        searchPlaceholder='Search invoices...'
        emptyMessage='No invoices found.'
        enableSorting
        enableFiltering
        enablePagination
        pageSize={pagination?.limit ?? 10}
        showButton
        onClick={() => setShowAddDialog(true)}
        buttonTitle='Create New Receipt'
      />

      {/* Dialogs and Sheets */}
      {showDetailsSheet && selectedReceipt && (
        <ReceiptDetailsSheet
          receipt={selectedReceipt}
          open={showDetailsSheet}
          onOpenChange={setShowDetailsSheet}
        />
      )}

      {showAddDialog && (
        <AddReceiptDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      )}

      {showEditDialog && selectedReceipt && (
        <EditReceiptDialog
          receipt={selectedReceipt}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}

      {showDeleteDialog && selectedReceipt && (
        <ConfirmationAlertDialog
          isOpen={showDeleteDialog}
          action='delete'
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}

      {showReportDialog && (
        <ReportGenerationDialog
          isOpen={showReportDialog}
          onOpenChange={setShowReportDialog}
          onGenerate={handleGenerateReport}
          isGenerating={generateReportMutation.isPending}
        />
      )}
    </div>
  );
};

export default ReceiptsPage;
