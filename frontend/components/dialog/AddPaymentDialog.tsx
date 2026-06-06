'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import TextInputField from '../form/text-input-field';
import { Form } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { useFetchAllBookings } from '@/hooks/useBookingsQuery';
import { useCreatePaymentMutation } from '@/hooks/usePaymentQueries';
import { toast } from 'sonner';
import { z } from 'zod';
import type { CreatePaymentFormValues } from '@/utils/schemas/payment.schema';
import { createPaymentSchema } from '@/utils/schemas/payment.schema';
import TextareaField from '../form/textarea-field';
import SelectInput from '../form/select-input';
import { SelectItem } from '../ui/select';
import { Field, FieldGroup } from '../ui/field';
import { Spinner } from '../ui/spinner';

interface AddPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const { data: bookings = [], isFetching: bookingsLoading } =
    useFetchAllBookings();

  const form = useForm<CreatePaymentFormValues>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      bookingId: '',
      amount: '',
      currency: 'GMD',
      method: 'CASH',
      gatewayResponse: 'Cash payment successful',
    },
    mode: 'onChange',
  });

  const { isValid } = form.formState;

  const createPaymentMutation = useCreatePaymentMutation({
    onSuccess: () => {
      toast.success('Payment created successfully');
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = error.message ?? 'Failed to create payment';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const onSubmit = (data: CreatePaymentFormValues) => {
    setError(null);
    const { amount, bookingId, ...rest } = data;

    createPaymentMutation.mutate({
      bookingId: Number(bookingId),
      amount: Number(amount),
      ...rest,
    });
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle>Add New Payment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Field className='text-black'>
              <SelectInput
                name='bookingId'
                control={form.control}
                label='Select Booking'
                placeholder='Select a booking'
                disabled={bookingsLoading}
              >
                {bookingsLoading ? (
                  <SelectItem value='0'>
                    <Spinner className='mr-2 h-4 w-4 animate-spin' />
                    Loading bookings...
                  </SelectItem>
                ) : (
                  bookings.map(booking => (
                    <SelectItem key={booking._id} value={booking._id.toString()}>
                      #{booking._id} - {booking.service?.title || 'N/A'}
                    </SelectItem>
                  ))
                )}
              </SelectInput>
            </Field>

            <div className='grid grid-cols-2 gap-4'>
              <Field>
                <FieldGroup>
                  <TextInputField
                    control={form.control}
                    name='amount'
                    label='Amount'
                    type='number'
                    placeholder='0.00'
                    error={form.formState.errors.amount}
                  />
                </FieldGroup>
              </Field>

              <Field>
                <FieldGroup>
                  <TextInputField
                    control={form.control}
                    name='currency'
                    label='Currency'
                    placeholder='GMD'
                    error={form.formState.errors.currency}
                  />
                </FieldGroup>
              </Field>
            </div>

            <SelectInput
              name='method'
              control={form.control}
              label='Payment Method'
              placeholder='Select payment method'
            >
              <SelectItem value='CASH'>Cash</SelectItem>
              <SelectItem value='WAVE'>Wave</SelectItem>
              <SelectItem value='APS'>APS</SelectItem>
              <SelectItem value='BANK'>Bank</SelectItem>
              <SelectItem value='YONNA'>Yonna</SelectItem>
            </SelectInput>

            <Field>
              <FieldGroup>
                <TextareaField
                  control={form.control}
                  name='gatewayResponse'
                  label='Gateway Response (Optional)'
                  placeholder='Gateway response or notes'
                />
              </FieldGroup>
            </Field>

            <div className='flex justify-end space-x-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={createPaymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={!isValid || createPaymentMutation.isPending}
              >
                {createPaymentMutation.isPending
                  ? 'Creating...'
                  : 'Create Payment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentDialog;
