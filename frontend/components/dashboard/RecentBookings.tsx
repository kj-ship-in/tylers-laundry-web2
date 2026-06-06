'use client';

import { useMemo, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/table/DataTable';
import type { Booking } from '@/types/booking';
import type { Column } from '@/types/table';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateBookingStatus } from '@/hooks/useBookingsQuery';
import UpdateBookingStatusDialog from '../dialog/UpdateBookingStatusDialog';

const TERMINAL_STATUSES = new Set(['COMPLETED', 'DELIVERED', 'CANCELLED']);

type RecentBookingsProps = {
  bookings: Booking[];
  isLoading: boolean;
  error?: string;
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'delivered':
      return <CheckCircle size={16} />;
    case 'in_progress':
      return <Clock size={16} />;
    case 'pending':
      return <AlertCircle size={16} />;
    case 'cancelled':
      return <XCircle size={16} />;
    default:
      return <Clock size={16} />;
  }
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 border-green-200',
    delivered: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    in_progress: 'bg-orange-100 text-orange-700 border-orange-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    colors[status.toLowerCase()] ?? 'bg-gray-100 text-gray-700 border-gray-200'
  );
};

const RecentBookings = ({ bookings, isLoading }: RecentBookingsProps) => {
  const updateStatusMutation = useUpdateBookingStatus();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<Booking['status']>('PENDING');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { hasPermission } = usePermissions();

  const canUpdateStatus = hasPermission('booking:update:status');

  const handleUpdateStatus = () => {
    if (!selectedBooking) return;
    updateStatusMutation.mutate(
      { bookingId: selectedBooking._id.toString(), status: newStatus },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setSelectedBooking(null);
        },
      },
    );
  };

  const columns = useMemo(() => {
    const cols: Column<Booking>[] = [
      {
        title: '#No',
        width: '60px',
        render: (_: any, __: any, index?: number) => (
          <div className='text-start text-slate-600'>
            {((index ?? 0) + 1).toString().padStart(2, '0')}
          </div>
        ),
      },
      {
        key: undefined,
        title: 'Service',
        render: (_: any, row?: Booking) => (
          <span className='text-gray-600'>{row?.service?.title ?? '-'}</span>
        ),
      },
      {
        key: 'pickupAddress' as keyof Booking,
        title: 'Pickup Address',
      },
      {
        key: 'deliveryAddress' as keyof Booking,
        title: 'Delivery Address',
        render: (value: string) => value || 'Same as pickup',
      },
      {
        key: 'totalAmount' as keyof Booking,
        title: 'Cost',
        render: (value: any) => (
          <span className='font-semibold text-gray-900'>GMD {value}</span>
        ),
      },
      {
        key: 'status' as keyof Booking,
        title: 'Status',
        render: (value: any) => (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}
          >
            {getStatusIcon(value)}
            {value.replace('_', ' ')}
          </span>
        ),
      },
      {
        key: 'date' as keyof Booking,
        title: 'Date',
        render: (value: string) => new Date(value).toLocaleDateString(),
      },
      {
        key: 'pickupTime' as keyof Booking,
        title: 'Pickup Time',
        render: (value: string) => value || 'N/A',
      },
    ];

    if (canUpdateStatus) {
      cols.push({
        key: undefined,
        title: 'Actions',
        render: (_: any, row?: Booking) => {
          if (!row) return null;
          if (TERMINAL_STATUSES.has(row.status)) {
            return <span className='text-gray-400 text-sm'>Finalized</span>;
          }
          return (
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                setSelectedBooking(row);
                setNewStatus(row.status);
                setDialogOpen(true);
              }}
            >
              Update Status
            </Button>
          );
        },
      });
    }

    return cols;
  }, [canUpdateStatus]);

  return (
    <>
      <Card className='lg:col-span-8 w-full bg-white rounded-xl shadow-sm border border-gray-200'>
        <CardHeader className='flex items-center justify-between'>
          <CardTitle className='text-xl font-bold text-gray-900'>
            Recent Bookings
          </CardTitle>
        </CardHeader>

        <CardContent className='w-full'>
          <DataTable
            columns={columns}
            data={bookings || []}
            loading={isLoading}
            enablePagination={false}
          />
        </CardContent>
      </Card>

      {canUpdateStatus && (
        <UpdateBookingStatusDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedBooking={selectedBooking}
          newStatus={newStatus}
          onStatusChange={setNewStatus}
          onUpdate={handleUpdateStatus}
          isUpdating={updateStatusMutation.isPending}
        />
      )}
    </>
  );
};

export default RecentBookings;
