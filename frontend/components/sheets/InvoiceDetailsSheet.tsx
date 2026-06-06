'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { InvoiceResponse, InvoiceStatus } from '@/types/payment';
import {
  FileText,
  Calendar,
  DollarSign,
  Hash,
  Trash2,
  CheckCircle,
  Download,
} from 'lucide-react';
import { formatToGMD } from '@/utils/helpers';

interface InvoiceDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceResponse | null;
  onDelete?: (invoiceId: number) => void;
  onMarkAsPaid?: (invoiceId: number) => void;
  onDownloadPDF?: (invoiceId: number) => void;
}

const InvoiceDetailsSheet: React.FC<InvoiceDetailsSheetProps> = ({
  isOpen,
  onClose,
  invoice,
  onDelete,
  onMarkAsPaid,
  onDownloadPDF,
}) => {
  if (!invoice) return null;

  const getStatusBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'UNPAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const finalAmount = invoice.totalAmount + invoice.tax - invoice.discount;
  const isOverdue =
    new Date(invoice.dueDate) < new Date() && invoice.status === 'UNPAID';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-2xl flex flex-col'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Invoice Details
          </SheetTitle>
          <SheetDescription>Invoice #{invoice.invoiceNo}</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto py-6'>
          <div className='space-y-6'>
            {/* Status and Basic Info */}
            <div className='flex items-center justify-between'>
              <Badge className={getStatusBadgeVariant(invoice.status)}>
                {invoice.status}
              </Badge>
              {isOverdue && (
                <Badge className='bg-red-100 text-red-800'>OVERDUE</Badge>
              )}
            </div>

            {/* Invoice Details */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Hash className='h-4 w-4' />
                  Invoice Number
                </div>
                <p className='font-mono font-medium'>{invoice.invoiceNo}</p>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Hash className='h-4 w-4' />
                  Payment ID
                </div>
                <p className='font-medium'>#{invoice.payment._id}</p>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Calendar className='h-4 w-4' />
                  Issued Date
                </div>
                <p className='font-medium'>
                  {format(new Date(invoice.issuedAt), 'PPP')}
                </p>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Calendar className='h-4 w-4' />
                  Due Date
                </div>
                <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {format(new Date(invoice.dueDate), 'PPP')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Amount Breakdown */}
            <div className='space-y-4'>
              <h3 className='font-semibold flex items-center gap-2'>
                <DollarSign className='h-4 w-4' />
                Amount Breakdown
              </h3>
              <div className='space-y-2 bg-gray-50 p-4 rounded-lg'>
                <div className='flex justify-between'>
                  <span>Subtotal:</span>
                  <span>{formatToGMD(invoice.totalAmount)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Tax:</span>
                  <span>{formatToGMD(invoice.tax)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Discount:</span>
                  <span className='text-green-600'>
                    -{formatToGMD(invoice.discount)}
                  </span>
                </div>
                <Separator />
                <div className='flex justify-between font-semibold text-lg'>
                  <span>Total:</span>
                  <span>{formatToGMD(finalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Receipt Information */}
            {invoice.receipt && (
              <>
                <Separator />
                <div className='space-y-4'>
                  <h3 className='font-semibold'>Receipt Information</h3>
                  <div className='bg-green-50 p-4 rounded-lg'>
                    <div className='flex items-center gap-2 mb-2'>
                      <CheckCircle className='h-4 w-4 text-green-600' />
                      <span className='font-medium text-green-800'>
                        Payment Received
                      </span>
                    </div>
                    <div className='text-sm text-green-700'>
                      <p>Receipt No: {invoice.receipt.receiptNo}</p>
                      <p>
                        Issued:{' '}
                        {format(new Date(invoice.receipt.issuedAt), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <div className='text-xs text-gray-500 space-y-1'>
              <p>Created: {format(new Date(invoice.createdAt), 'PPP p')}</p>
              <p>Updated: {format(new Date(invoice.updatedAt), 'PPP p')}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 pt-4 border-t'>
          {onDownloadPDF && (
            <Button
              variant='outline'
              onClick={() => onDownloadPDF(invoice._id)}
              className='flex-1'
            >
              <Download className='h-4 w-4 mr-2' />
              Download PDF
            </Button>
          )}
          {invoice.status === 'UNPAID' && onMarkAsPaid && (
            <Button
              onClick={() => onMarkAsPaid(invoice._id)}
              className='flex-1 bg-green-600 hover:bg-green-700'
            >
              <CheckCircle className='h-4 w-4 mr-2' />
              Mark as Paid
            </Button>
          )}
          {onDelete && (
            <Button
              variant='destructive'
              onClick={() => onDelete(invoice._id)}
              className='flex-1'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete Invoice
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default InvoiceDetailsSheet;
