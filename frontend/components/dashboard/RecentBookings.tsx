'use client';

import React, { useMemo, useState } from 'react';
import {
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRecentBookings } from '@/hooks/useAdminDashboardQueries';
import DataTable from '@/components/table/DataTable';
import type { Booking } from '@/types/booking';
import type { Column } from '@/types/table';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/permission';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateBookingStatus } from '@/hooks/useBookingsQuery';
import UpdateBookingStatusDialog from '../dialog/UpdateBookingStatusDialog';

type RecentBookingsProps = {
  bookings: Booking[];
  isLoading: boolean;
  error?: string;
};

const RecentBookings = ({ bookings, isLoading }: RecentBookingsProps) => {
  // Permission checks
  const queryClient = useQueryClient();
  const updateStatusMutation = useUpdateBookingStatus();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<Booking['status']>('PENDING');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Permission checks
  const { hasPermission } = usePermissions();
  const handleUpdateStatus = () => {
    if (selectedBooking) {
      updateStatusMutation.mutate(
        {
          bookingId: selectedBooking.id.toString(),
          status: newStatus,
        },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setSelectedBooking(null);
          },
        },
      );
    }
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
    const colors: { [key: string]: string } = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      delivered: 'bg-green-100 text-green-700 border-green-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
      colors[status.toLowerCase()] ||
      'bg-blue-100 text-blue-700 border-blue-200'
    );
  };

  const columns = useMemo(
    () =>
      [
        {
          title: '#No',
          width: '60px',
          render: (_: any, __: any, index?: number) => {
            const rowIndex = (index ?? 0) + 1;
            const formattedIndex = rowIndex.toString().padStart(2, '0');
            return (
              <div className='text-start text-slate-600'>{formattedIndex}</div>
            );
          },
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
          key: 'totalAmount' as const,
          title: 'Cost',
          render: (value: any) => (
            <span className='font-semibold text-gray-900'>GMD {value}</span>
          ),
        },
        {
          key: 'status' as const,
          title: 'Status',
          render: (value: any) => (
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}
            >
              {getStatusIcon(value)}
              {value}
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
        {
          key: undefined,
          title: 'Actions',
          render: (_: any, row?: Booking) => {
            if (!row) return null;

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
        },
      ] as Column<Booking>[],
    [],
  );

  return (
    <>
      <Card className='lg:col-span-8 w-full bg-white rounded-xl shadow-sm border border-gray-200'>
        <CardHeader className='flex items-center justify-between'>
          <CardTitle className='text-xl font-bold text-gray-900'>
            Recent Bookings
          </CardTitle>
          <div className='flex items-center gap-2'>
            <Button className='p-2 bg-gray-100 hover:bg-gray-100 rounded-lg transition'>
              <Filter size={20} className='text-gray-600' />
            </Button>
            <Button className='p-2 bg-gray-100 hover:bg-gray-100 rounded-lg transition'>
              <Download size={20} className='text-gray-600' />
            </Button>
          </div>
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

      <UpdateBookingStatusDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedBooking={selectedBooking}
        newStatus={newStatus}
        onStatusChange={setNewStatus}
        onUpdate={handleUpdateStatus}
        isUpdating={updateStatusMutation.isPending}
      />
    </>
  );
};

export default RecentBookings;
