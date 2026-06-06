'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type {
  PaymentResponse,
  PaymentStatus,
  UpdatePaymentRequest,
} from '@/types/payment';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import TextInputField from '../form/text-input-field';
import { Form } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { useUpdatePaymentMutation } from '@/hooks/usePaymentQueries';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { z } from 'zod';

const updatePaymentSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED'], {
    message: 'Payment status is required',
  }),
  gatewayResponse: z.string().optional(),
});

type UpdatePaymentFormValues = z.infer<typeof updatePaymentSchema>;

interface EditPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentResponse | null;
  onSuccess?: () => void;
}
const EditPaymentDialog: React.FC<EditPaymentDialogProps> = ({
  isOpen,
  onClose,
  payment,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdatePaymentFormValues>({
    resolver: zodResolver(updatePaymentSchema),
    defaultValues: {
      status: 'PENDING',
      gatewayResponse: '',
    },
    mode: 'onChange',
  });

  const updatePaymentMutation = useUpdatePaymentMutation({
    onSuccess: () => {
      toast.success('Payment updated successfully');
      onSuccess?.();
    },
    onError: (error: any) => {
      const errorMessage = error.message ?? 'Failed to update payment';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  // Reset form when payment changes
  useEffect(() => {
    if (payment) {
      form.reset({
        status: payment.status,
        gatewayResponse: payment.gatewayResponse ?? '',
      });
    }
  }, [payment, form]);

  const onSubmit = (data: UpdatePaymentFormValues) => {
    if (!payment) return;

    setError(null);
    updatePaymentMutation.mutate({
      paymentId: payment.id,
      data,
    });
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    onClose();
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Update Payment Status</DialogTitle>
        </DialogHeader>

        <div className='mb-4 p-4 bg-gray-50 rounded-lg'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-900'>
                Payment #{payment._id}
              </p>
              <p className='text-sm text-gray-600'>
                Transaction: {payment.transactionId}
              </p>
            </div>
            <div className='text-right'>
              <p className='text-lg font-semibold'>
                {payment.currency} {Number(payment.amount).toFixed(2)}
              </p>
              <p className='text-sm text-gray-600'>{payment.method}</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldDescription>Payment Status</FieldDescription>
              <Controller
                name='status'
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select payment status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='PENDING'>Pending</SelectItem>
                      <SelectItem value='PAID'>Paid</SelectItem>
                      <SelectItem value='FAILED'>Failed</SelectItem>
                      <SelectItem value='REFUNDED'>Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.status && (
                <p className='text-sm text-red-600'>
                  {form.formState.errors.status.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldDescription>Gateway Response (Optional)</FieldDescription>
              <div className='flex items-start space-x-2'>
                <FileText className='h-4 w-4 text-gray-400 mt-2' />
                <textarea
                  className='flex-1 min-h-20 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Update gateway response or add notes'
                  {...form.register('gatewayResponse')}
                />
              </div>
            </Field>

            <div className='flex justify-end space-x-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={updatePaymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updatePaymentMutation.isPending}>
                {updatePaymentMutation.isPending
                  ? 'Updating...'
                  : 'Update Payment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPaymentDialog;
