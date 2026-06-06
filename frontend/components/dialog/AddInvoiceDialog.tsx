'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import TextInputField from '../form/text-input-field';
import { Form } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { usePayments } from '@/hooks/usePaymentQueries';
import { useCreateInvoiceMutation } from '@/hooks/useInvoiceQueries';
import { toast } from 'sonner';
import type { CreateInvoiceFormValues } from '@/utils/schemas/invoice.schema';
import { createInvoiceSchema } from '@/utils/schemas/invoice.schema';
import SelectInput from '../form/select-input';
import { SelectItem } from '../ui/select';
import { Field, FieldGroup } from '../ui/field';
import { Spinner } from '../ui/spinner';

interface AddInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddInvoiceDialog: React.FC<AddInvoiceDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const { data: paymentsData, isFetching: paymentsLoading } = usePayments({
    limit: 100, // Get more payments for selection
  });
  const payments = paymentsData?.data ?? [];

  const form = useForm<CreateInvoiceFormValues>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      paymentId: '',
      totalAmount: '',
      tax: '0',
      discount: '0',
      issuedAt: '',
      dueDate: '',
      status: 'UNPAID' as const,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        paymentId: '',
        totalAmount: '',
        tax: '0',
        discount: '0',
        issuedAt: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 30 days from now
        status: 'UNPAID' as const,
      });
    }
  }, [isOpen, form]);

  const createInvoiceMutation = useCreateInvoiceMutation({
    onSuccess: () => {
      toast.success('Invoice created successfully');
      form.reset();
      setError(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      setError(error.message ?? 'Failed to create invoice');
      toast.error(error.message ?? 'Failed to create invoice');
    },
  });

  const onSubmit = (data: CreateInvoiceFormValues) => {
    setError(null);

    const payload = {
      paymentId: parseInt(data.paymentId),
      totalAmount: parseFloat(data.totalAmount),
      tax: parseFloat(data.tax ?? '0'),
      discount: parseFloat(data.discount ?? '0'),
      issuedAt: new Date(data.issuedAt).toISOString(),
      dueDate: new Date(data.dueDate).toISOString(),
      status: data.status,
    };

    createInvoiceMutation.mutate(payload);
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FieldGroup>
              <Field>
                <SelectInput
                  control={form.control}
                  name='paymentId'
                  label='Payment'
                  placeholder='Select a payment'
                  disabled={paymentsLoading}
                >
                  {payments.map(payment => (
                    <SelectItem key={payment._id} value={payment._id.toString()}>
                      Payment #{payment._id} - {payment.transactionId} (
                      {formatToGMD(payment.amount)})
                    </SelectItem>
                  ))}
                </SelectInput>
              </Field>

              <Field>
                <TextInputField
                  control={form.control}
                  name='totalAmount'
                  label='Total Amount'
                  type='number'
                  step='0.01'
                  placeholder='0.00'
                />
              </Field>

              <div className='grid grid-cols-2 gap-4'>
                <Field>
                  <TextInputField
                    control={form.control}
                    name='tax'
                    label='Tax'
                    type='number'
                    step='0.01'
                    placeholder='0.00'
                  />
                </Field>
                <Field>
                  <TextInputField
                    control={form.control}
                    name='discount'
                    label='Discount'
                    type='number'
                    step='0.01'
                    placeholder='0.00'
                  />
                </Field>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <Field>
                  <TextInputField
                    control={form.control}
                    name='issuedAt'
                    label='Issued Date'
                    type='date'
                  />
                </Field>
                <Field>
                  <TextInputField
                    control={form.control}
                    name='dueDate'
                    label='Due Date'
                    type='date'
                  />
                </Field>
              </div>

              <Field>
                <SelectInput
                  control={form.control}
                  name='status'
                  label='Status'
                >
                  <SelectItem value='UNPAID'>Unpaid</SelectItem>
                  <SelectItem value='PAID'>Paid</SelectItem>
                  <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                </SelectInput>
              </Field>
            </FieldGroup>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={createInvoiceMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={createInvoiceMutation.isPending}>
                {createInvoiceMutation.isPending && (
                  <Spinner className='mr-2 h-4 w-4' />
                )}
                Create Invoice
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Helper function for formatting currency
const formatToGMD = (amount: number) => {
  return new Intl.NumberFormat('en-GM', {
    style: 'currency',
    currency: 'GMD',
  }).format(amount);
};

export default AddInvoiceDialog;
