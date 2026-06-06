'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Booking } from '@/types/booking.d';
import { Label } from '../ui/label';

interface UpdateBookingStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBooking: Booking | null;
  newStatus: Booking['status'];
  onStatusChange: (status: Booking['status']) => void;
  onUpdate: () => void;
  isUpdating: boolean;
}

const UpdateBookingStatusDialog: React.FC<UpdateBookingStatusDialogProps> = ({
  open,
  onOpenChange,
  selectedBooking,
  newStatus,
  onStatusChange,
  onUpdate,
  isUpdating,
}) => {
  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-orange-100 text-orange-800',
    COMPLETED: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-indigo-100 text-indigo-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Booking Status</DialogTitle>
          <DialogDescription>
            Current status:{' '}
            <Badge
              className={statusColors[selectedBooking?.status ?? 'PENDING']}
            >
              {selectedBooking?.status}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='w-full'>
            <Label className='block text-sm font-medium mb-2'>
              Select new status:
            </Label>
            <Select value={newStatus} onValueChange={onStatusChange}>
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                <SelectItem value='COMPLETED'>Completed</SelectItem>
                <SelectItem value='DELIVERED'>Delivered</SelectItem>
                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={onUpdate}
            disabled={isUpdating}
            className='bg-blue-500 hover:bg-blue-600 text-white'
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBookingStatusDialog;
