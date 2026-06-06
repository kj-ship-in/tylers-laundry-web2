'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import type { InvoiceResponse, InvoiceStatus } from '@/types/payment';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import TextInputField from '../form/text-input-field';
import { Form } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { useUpdateInvoiceMutation } from '@/hooks/useInvoiceQueries';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UpdateInvoiceFormValues } from '@/utils/schemas/invoice.schema';
import { updateInvoiceSchema } from '@/utils/schemas/invoice.schema';
import { Spinner } from '../ui/spinner';

interface EditInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceResponse | null;
  onSuccess?: () => void;
}

const EditInvoiceDialog: React.FC<EditInvoiceDialogProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdateInvoiceFormValues>({
    resolver: zodResolver(updateInvoiceSchema),
    defaultValues: {
      tax: '',
      discount: '',
      dueDate: '',
      status: 'UNPAID',
    },
  });

  const watchedStatus = useWatch({ control: form.control, name: 'status' });

  const updateInvoiceMutation = useUpdateInvoiceMutation({
    onSuccess: () => {
      toast.success('Invoice updated successfully');
      setError(null);
      onSuccess?.();
    },
    onError: (error: any) => {
      setError(error.message ?? 'Failed to update invoice');
      toast.error(error.message ?? 'Failed to update invoice');
    },
  });

  // Reset form when invoice changes
  useEffect(() => {
    if (invoice) {
      form.reset({
        tax: invoice.tax.toString(),
        discount: invoice.discount.toString(),
        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
        status: invoice.status,
      });
    }
  }, [invoice, form]);

  const onSubmit = (data: UpdateInvoiceFormValues) => {
    if (!invoice) return;

    setError(null);

    const payload = {
      tax: data.tax ? parseFloat(data.tax) : undefined,
      discount: data.discount ? parseFloat(data.discount) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      status: data.status,
    };

    updateInvoiceMutation.mutate({
      invoiceId: invoice.id,
      data: payload,
    });
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    onClose();
  };

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Update Invoice
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='font-medium mb-2'>Invoice #{invoice.invoiceNo}</h4>
              <p className='text-sm text-gray-600'>
                Payment ID: #{invoice.payment._id}
              </p>
              <p className='text-sm text-gray-600'>
                Total:{' '}
                {formatToGMD(
                  invoice.totalAmount + invoice.tax - invoice.discount,
                )}
              </p>
            </div>

            <FieldGroup>
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

              <Field>
                <TextInputField
                  control={form.control}
                  name='dueDate'
                  label='Due Date'
                  type='date'
                />
              </Field>

              <Field>
                <label className='text-sm font-medium'>Status</label>
                <Select
                  value={watchedStatus}
                  onValueChange={(value: InvoiceStatus) =>
                    form.setValue('status', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='UNPAID'>Unpaid</SelectItem>
                    <SelectItem value='PAID'>Paid</SelectItem>
                    <SelectItem value='OVERDUE'>Overdue</SelectItem>
                    <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={updateInvoiceMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updateInvoiceMutation.isPending}>
                {updateInvoiceMutation.isPending && (
                  <Spinner className='mr-2 h-4 w-4' />
                )}
                Update Invoice
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

export default EditInvoiceDialog;
