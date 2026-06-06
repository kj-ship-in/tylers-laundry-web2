'use client';

import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import { Label } from '@/components/ui/label';
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

import type { AdminBookingFormValues } from '@/utils/schemas/booking.schema';
import { createAdminBookingSchema } from '@/utils/schemas/booking.schema';
import { useCreateAdminBooking } from '@/hooks/useBookingsQuery';
import { useCustomers } from '@/hooks/useUserQuery';
import { useFetchServices } from '@/hooks/useServicesQuery';

type FormData = AdminBookingFormValues;

interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
}

const AddBookingDialog: React.FC<AddBookingDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(createAdminBookingSchema),
    defaultValues: {
      userId: '',
      serviceId: '',
      pickupAddress: '',
      deliveryAddress: '',
      date: '',
      pickupTime: '',
      serviceType: '',
      note: '',
      totalAmount: 0,
      deliveryFee: 0,
    },
  });

  const createBookingMutation = useCreateAdminBooking();

  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: services, isLoading: servicesLoading } = useFetchServices();

  const watchedServiceId = useWatch({
    control: form.control,
    name: 'serviceId',
  });

  const watchedDeliveryFee = useWatch({
    control: form.control,
    name: 'deliveryFee',
  });

  const onSubmit = async (values: FormData) => {
    setError(null);
    try {
      // Calculate total amount based on service price
      const selectedService = services?.find(
        s => s._id.toString() === values.serviceId,
      );
      const servicePrice = selectedService?.price ?? 0;
      const totalAmount = servicePrice + values.deliveryFee;

      const bookingData = {
        ...values,
        totalAmount,
      };

      await createBookingMutation.mutateAsync(bookingData);

      onSuccess?.('Booking created successfully!');
      onOpenChange(false);
      form.reset();
    } catch (err: any) {
      setError(err.message ?? 'Failed to create booking');
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
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Book a service for a client. Fill in the details below.
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

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Client Selection */}
              <FormField
                control={form.control}
                name='userId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={value => field.onChange(parseInt(value))}
                      value={field.value?.toString() ?? ''}
                      disabled={customersLoading}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select a client' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='w-full'>
                        {customers?.data?.map(customer => (
                          <SelectItem
                            key={customer._id}
                            value={customer._id.toString()}
                          >
                            {customer.name} - ({customer.phone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select a service' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='w-full'>
                        {services?.map(service => (
                          <SelectItem
                            key={service._id}
                            value={service._id.toString()}
                          >
                            {service.title} - GMD From {service.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Delivery Fee */}
              <FormField
                control={form.control}
                name='deliveryFee'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Fee</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                        onChange={e =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total Amount (calculated) */}
              <div className='space-y-2'>
                <Label>Total Amount</Label>
                <div className='flex items-center space-x-2'>
                  <Input
                    type='number'
                    step='0.01'
                    value={
                      (services?.find(
                        s => s._id.toString() === watchedServiceId,
                      )?.price ?? 0) + (watchedDeliveryFee || 0)
                    }
                    readOnly
                    className='bg-gray-50'
                  />
                  <span className='text-sm text-gray-500'>Auto-calculated</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleOpenChange(false)}
                disabled={createBookingMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={createBookingMutation.isPending}>
                {createBookingMutation.isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating...
                  </>
                ) : (
                  'Create Booking'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookingDialog;
