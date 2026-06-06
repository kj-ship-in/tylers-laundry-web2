'use client';

import { useState } from 'react';
import DataTable from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  usePayments,
  useDeletePaymentMutation,
  useProcessPaymentMutation,
  useRefundPaymentMutation,
} from '@/hooks/usePaymentQueries';
import type {
  PaymentResponse,
  PaymentStatus,
  PaymentMethod,
} from '@/types/payment';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  MoreHorizontal,
  Eye,
  Trash2,
  CreditCard,
  RefreshCw,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PaymentDetailsSheet from '@/components/sheets/PaymentDetailsSheet';
import AddPaymentDialog from '@/components/dialog/AddPaymentDialog';
import EditPaymentDialog from '@/components/dialog/EditPaymentDialog';
import Image from 'next/image';
import { appImages } from '@/constants/app-images';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { usePermissions } from '@/hooks/usePermissions';

const PaymentsPage = () => {
  // Permission checks
  const { hasPermission } = usePermissions();

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>(
    'ALL',
  );
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'ALL'>(
    'ALL',
  );
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Dialog and sheet state
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentResponse | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Alert dialog state
  const [alertDialogState, setAlertDialogState] = useState<{
    isOpen: boolean;
    action: 'process' | 'refund' | 'delete' | null;
    payment: PaymentResponse | null;
    refundReason?: string;
  }>({
    isOpen: false,
    action: null,
    payment: null,
  });

  // Build query params
  const queryParams = {
    page,
    limit: pageSize,
    ...(search && { search }),
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(methodFilter !== 'ALL' && { method: methodFilter }),
    ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
    ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
  };

  const { data, isLoading, error, refetch } = usePayments(queryParams);
  const payments = data?.data ?? [];
  const pagination = data?.pagination;

  // Mutations
  const deletePaymentMutation = useDeletePaymentMutation({
    onSuccess: () => {
      toast.success('Payment deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to delete payment');
    },
  });

  const processPaymentMutation = useProcessPaymentMutation({
    onSuccess: () => {
      toast.success('Payment processed successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to process payment');
    },
  });

  const refundPaymentMutation = useRefundPaymentMutation({
    onSuccess: () => {
      toast.success('Payment refunded successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to refund payment');
    },
  });
  const openProcessAlert = (payment: PaymentResponse) => {
    setAlertDialogState({
      isOpen: true,
      action: 'process',
      payment,
    });
  };

  const openRefundAlert = (payment: PaymentResponse) => {
    setAlertDialogState({
      isOpen: true,
      action: 'refund',
      payment,
    });
  };

  const openDeleteAlert = (payment: PaymentResponse) => {
    setAlertDialogState({
      isOpen: true,
      action: 'delete',
      payment,
    });
  };

  const closeAlertDialog = () => {
    setAlertDialogState({
      isOpen: false,
      action: null,
      payment: null,
    });
  };

  const handleAlertConfirm = () => {
    if (!alertDialogState.payment) return;

    const { action, payment } = alertDialogState;

    switch (action) {
      case 'process':
        processPaymentMutation.mutate(payment._id);
        break;
      case 'refund':
        // For refund, we'll use a simple approach without prompt for now
        // In a real app, you might want a separate dialog for refund reason
        refundPaymentMutation.mutate({
          paymentId: payment._id,
          reason: 'Refund requested by admin',
        });
        break;
      case 'delete':
        deletePaymentMutation.mutate(payment._id);
        break;
    }

    closeAlertDialog();
  };

  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: PaymentMethod) => {
    const imageSrc = appImages[method.toLowerCase() as keyof typeof appImages];
    return <Image src={imageSrc} alt={method} width={24} height={24} />;
  };

  const columns: Array<{
    key?: keyof PaymentResponse;
    title: string;
    width?: string;
    render?: (
      value: any,
      row?: PaymentResponse,
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
      title: 'Customer',
      render: (_: any, row?: PaymentResponse) => {
        if (!row?.booking?.user)
          return <span className='text-gray-400'>N/A</span>;
        return (
          <div>
            <p className='text-sm font-medium'>{row.booking.user.name}</p>
            <p className='text-xs text-gray-500'>{row.booking.user.phone}</p>
          </div>
        );
      },
    },
    {
      key: 'transactionId',
      title: 'Transaction ID',
      render: (value: string) => (
        <span className='font-mono text-sm'>{value}</span>
      ),
    },
    {
      title: 'Booking Service',
      render: (_: any, row?: PaymentResponse) => {
        if (!row?.booking) return <span className='text-gray-400'>N/A</span>;
        return (
          <div>
            <p className='text-sm font-medium'>{row.booking.service.type}</p>
            <p className='text-xs text-gray-500'>
              {row.booking.service?.description}
            </p>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      render: (_: any, row?: PaymentResponse) => {
        if (!row) return null;
        return (
          <div className='text-center'>
            <p className='font-semibold'>
              {row.currency} {Number(row.amount).toFixed(2)}
            </p>
          </div>
        );
      },
    },
    {
      key: 'method',
      title: 'Method',
      render: (value: PaymentMethod) => getMethodIcon(value),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: PaymentStatus) => (
        <Badge className={getStatusBadgeVariant(value)}>{value}</Badge>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Actions',
      width: '100px',
      render: (_: any, row?: PaymentResponse) => {
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
                    setSelectedPayment(row);
                    setIsDetailsSheetOpen(true);
                  }}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  View Details
                </button>
                {hasPermission('payment:update') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                    onClick={() => {
                      setSelectedPayment(row);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Update Status
                  </button>
                )}
                {row.status === 'PENDING' &&
                  hasPermission('payment:process') && (
                    <button
                      className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                      onClick={() => openProcessAlert(row)}
                    >
                      <CreditCard className='mr-2 h-4 w-4' />
                      Process Payment
                    </button>
                  )}
                {row.status === 'PAID' && hasPermission('payment:process') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm text-orange-600 hover:bg-gray-100'
                    onClick={() => openRefundAlert(row)}
                  >
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Refund
                  </button>
                )}
                {hasPermission('payment:delete') && (
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
            Error loading payments: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Payments</h1>
          <p className='text-gray-600'>
            Manage and track all payment transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
        <div className='grid grid-cols-1 md:grid-cols-6 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Search
            </label>
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search payments...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Status
            </label>
            <Select
              value={statusFilter}
              onValueChange={(value: PaymentStatus | 'ALL') =>
                setStatusFilter(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Status</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='PAID'>Paid</SelectItem>
                <SelectItem value='FAILED'>Failed</SelectItem>
                <SelectItem value='REFUNDED'>Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Method
            </label>
            <Select
              value={methodFilter}
              onValueChange={(value: PaymentMethod | 'ALL') =>
                setMethodFilter(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='Select method' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>All Methods</SelectItem>
                <SelectItem value='CASH'>Cash</SelectItem>
                <SelectItem value='WAVE'>Wave</SelectItem>
                <SelectItem value='APS'>APS</SelectItem>
                <SelectItem value='BANK'>Bank</SelectItem>
                <SelectItem value='YONNA'>Yonna</SelectItem>
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
                setMethodFilter('ALL');
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
        data={payments}
        loading={isLoading}
        searchPlaceholder='Search payments...'
        emptyMessage='No payments found.'
        enableSorting
        enableFiltering
        enablePagination
        pageSize={pagination?.limit ?? 10}
        showButton
        onClick={() => setIsAddDialogOpen(true)}
        buttonTitle='Add New Payment'
        // Note: DataTable manages search and pagination internally. To sync with server, see comment below.
      />

      {/* Dialogs and Sheets */}
      <PaymentDetailsSheet
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
        payment={selectedPayment}
        onDelete={_paymentId => openDeleteAlert(selectedPayment!)}
        onProcess={_paymentId => openProcessAlert(selectedPayment!)}
        onRefund={_paymentId => openRefundAlert(selectedPayment!)}
      />

      <AddPaymentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          refetch();
          setIsAddDialogOpen(false);
        }}
      />

      <EditPaymentDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        payment={selectedPayment}
        onSuccess={() => {
          refetch();
          setIsEditDialogOpen(false);
        }}
      />

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialogState.isOpen}
        onOpenChange={closeAlertDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {alertDialogState.action === 'process' && 'Process Payment'}
              {alertDialogState.action === 'refund' && 'Refund Payment'}
              {alertDialogState.action === 'delete' && 'Delete Payment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertDialogState.action === 'process' &&
                'Are you sure you want to process this payment? This action cannot be undone.'}
              {alertDialogState.action === 'refund' &&
                'Are you sure you want to refund this payment? This action cannot be undone.'}
              {alertDialogState.action === 'delete' &&
                'Are you sure you want to delete this payment? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAlertConfirm}
              className={
                alertDialogState.action === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : alertDialogState.action === 'refund'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
              }
            >
              {alertDialogState.action === 'process' && 'Process'}
              {alertDialogState.action === 'refund' && 'Refund'}
              {alertDialogState.action === 'delete' && 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentsPage;
