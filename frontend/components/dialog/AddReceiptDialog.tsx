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
import TextareaField from '../form/textarea-field';
import { Form } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { useInvoices } from '@/hooks/useInvoiceQueries';
import { useCreateReceiptMutation } from '@/hooks/useReceiptQueries';
import { toast } from 'sonner';
import type { CreateReceiptFormValues } from '@/utils/schemas/receipt.schema';
import { createReceiptSchema } from '@/utils/schemas/receipt.schema';
import SelectInput from '../form/select-input';
import { SelectItem } from '../ui/select';
import { Field, FieldGroup } from '../ui/field';
import { Spinner } from '../ui/spinner';
import { formatToGMD } from '@/utils/helpers';

interface AddReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddReceiptDialog: React.FC<AddReceiptDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const { data: invoicesData, isFetching: invoicesLoading } = useInvoices({
    limit: 100, // Get more invoices for selection
  });
  const invoices = invoicesData?.data ?? [];

  const form = useForm<CreateReceiptFormValues>({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: {
      invoiceId: '',
      issuedAt: '',
      receivedBy: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        invoiceId: '',
        issuedAt: new Date().toISOString().split('T')[0],
        receivedBy: '',
        notes: '',
      });
    }
  }, [open, form]);

  const createReceiptMutation = useCreateReceiptMutation({
    onSuccess: () => {
      toast.success('Receipt created successfully');
      form.reset();
      setError(null);
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: any) => {
      setError(error.message ?? 'Failed to create receipt');
      toast.error(error.message ?? 'Failed to create receipt');
    },
  });

  const onSubmit = (data: CreateReceiptFormValues) => {
    setError(null);

    const payload = {
      invoiceId: data.invoiceId,
      issuedAt: new Date(data.issuedAt).toISOString(),
      receivedBy: data.receivedBy || undefined,
      notes: data.notes || undefined,
    };

    createReceiptMutation.mutate(payload);
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Receipt</DialogTitle>
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
                  name='invoiceId'
                  label='Invoice'
                  placeholder='Select an invoice'
                  disabled={invoicesLoading}
                >
                  {invoices.map(invoice => (
                    <SelectItem
                      key={invoice._id}
                      value={invoice._id.toString()}
                    >
                      Invoice #{invoice._id} -{' '}
                      {formatToGMD(invoice.totalAmount)}
                    </SelectItem>
                  ))}
                </SelectInput>
              </Field>

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
                  name='receivedBy'
                  label='Received By'
                  placeholder='Enter recipient name'
                />
              </Field>

              <Field>
                <TextareaField
                  control={form.control}
                  name='notes'
                  label='Notes'
                  placeholder='Additional notes (optional)'
                />
              </Field>
            </FieldGroup>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={createReceiptMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={createReceiptMutation.isPending}>
                {createReceiptMutation.isPending && (
                  <Spinner className='mr-2 h-4 w-4' />
                )}
                Create Receipt
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddReceiptDialog;
