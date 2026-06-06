'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import type { Receipt } from '@/types/receipt';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import TextInputField from '../form/text-input-field';
import TextareaField from '../form/textarea-field';
import { Form } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { useUpdateReceiptMutation } from '@/hooks/useReceiptQueries';
import { toast } from 'sonner';
import type { UpdateReceiptFormValues } from '@/utils/schemas/receipt.schema';
import { updateReceiptSchema } from '@/utils/schemas/receipt.schema';
import { Spinner } from '../ui/spinner';
import { formatToGMD } from '@/utils/helpers';

interface EditReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: Receipt | null;
  onSuccess?: () => void;
}

const EditReceiptDialog: React.FC<EditReceiptDialogProps> = ({
  open,
  onOpenChange,
  receipt,
  onSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UpdateReceiptFormValues>({
    resolver: zodResolver(updateReceiptSchema),
    defaultValues: {
      receivedBy: '',
      notes: '',
    },
  });

  const updateReceiptMutation = useUpdateReceiptMutation({
    onSuccess: () => {
      toast.success('Receipt updated successfully');
      setError(null);
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (error: any) => {
      setError(error.message ?? 'Failed to update receipt');
      toast.error(error.message ?? 'Failed to update receipt');
    },
  });

  // Reset form when receipt changes
  useEffect(() => {
    if (receipt) {
      form.reset({
        receivedBy: receipt.receivedBy || '',
        notes: receipt.notes || '',
      });
    }
  }, [receipt, form]);

  const onSubmit = (data: UpdateReceiptFormValues) => {
    if (!receipt) return;

    setError(null);

    const payload = {
      receivedBy: data.receivedBy || undefined,
      notes: data.notes || undefined,
    };

    updateReceiptMutation.mutate({
      receiptId: receipt._id,
      payload,
    });
  };

  const handleClose = () => {
    form.reset();
    setError(null);
    onOpenChange(false);
  };

  if (!receipt) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Update Receipt
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
              <h4 className='font-medium mb-2'>Receipt #{receipt.receiptNo}</h4>
              <p className='text-sm text-gray-600'>
                Invoice ID: #{receipt.invoice._id}
              </p>
              <p className='text-sm text-gray-600'>
                Amount: {formatToGMD(receipt.invoice.totalAmount)}
              </p>
              <p className='text-sm text-gray-600'>
                Issued: {new Date(receipt.issuedAt).toLocaleDateString()}
              </p>
            </div>

            <FieldGroup>
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
                  placeholder='Additional notes'
                />
              </Field>
            </FieldGroup>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={updateReceiptMutation.isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updateReceiptMutation.isPending}>
                {updateReceiptMutation.isPending && (
                  <Spinner className='mr-2 h-4 w-4' />
                )}
                Update Receipt
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReceiptDialog;
