'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import type { SchedulePickupFormValues } from '@/utils/schemas/booking.schema';
import { schedulePickupSchema } from '@/utils/schemas/booking.schema';
import { useSchedulePickup } from '@/hooks/useBookingsQuery';
import { useFetchServices } from '@/hooks/useServicesQuery';

type FormData = SchedulePickupFormValues;

interface SchedulePickupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
}

const SchedulePickupDialog: React.FC<SchedulePickupDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schedulePickupSchema),
    defaultValues: {
      serviceId: '',
      pickupAddress: '',
      deliveryAddress: '',
      date: '',
      pickupTime: '',
      note: '',
    },
  });

  const schedulePickupMutation = useSchedulePickup();

  const { data: services, isLoading: servicesLoading } = useFetchServices();

  const onSubmit = async (values: FormData) => {
    setError(null);
    try {
      const pickupData = {
        ...values,
        serviceId: parseInt(values.serviceId),
      };

      await schedulePickupMutation.mutateAsync(pickupData);

      onSuccess?.('Pickup scheduled successfully!');
      onOpenChange(false);
      form.reset();
    } catch (err: any) {
      setError(err.message ?? 'Failed to schedule pickup');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Schedule Pickup</DialogTitle>
          <DialogDescription>
            Schedule a pickup for laundry service. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {error && (
              <Alert className='border-red-500 bg-red-50'>
                <AlertDescription className='text-red-500'>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Service Selection */}
            <FormField
              control={form.control}
              name='serviceId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={servicesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a service' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services?.map(service => (
                        <SelectItem
                          key={service._id}
                          value={service._id.toString()}
                        >
                          {service.title} - GMD {service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pickup Address */}
            <FormField
              control={form.control}
              name='pickupAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pickup Address</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter pickup address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Address */}
            <FormField
              control={form.control}
              name='deliveryAddress'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter delivery address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Date */}
              <FormField
                control={form.control}
                name='date'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Date</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pickup Time */}
              <FormField
                control={form.control}
                name='pickupTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Time</FormLabel>
                    <FormControl>
                      <Input type='time' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Note */}
            <FormField
              control={form.control}
              name='note'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Add any special instructions...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={schedulePickupMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={schedulePickupMutation.isPending}>
                {schedulePickupMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Pickup'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulePickupDialog;
