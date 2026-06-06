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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Receipt } from '@/types/receipt';
import {
  FileText,
  Calendar,
  DollarSign,
  Hash,
  Download,
  User,
} from 'lucide-react';
import { formatToGMD } from '@/utils/helpers';

interface ReceiptDetailsSheetProps {
  receipt: Receipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadPDF?: (receiptId: number) => void;
}

const ReceiptDetailsSheet: React.FC<ReceiptDetailsSheetProps> = ({
  receipt,
  open,
  onOpenChange,
  onDownloadPDF,
}) => {
  if (!receipt) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-2xl flex flex-col'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Receipt Details
          </SheetTitle>
          <SheetDescription>Receipt #{receipt.receiptNo}</SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto py-6'>
          <div className='space-y-6'>
            {/* Receipt Details */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Hash className='h-4 w-4' />
                  Receipt Number
                </div>
                <p className='font-mono font-medium'>{receipt.receiptNo}</p>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Hash className='h-4 w-4' />
                  Invoice ID
                </div>
                <p className='font-medium'>#{receipt.invoice._id}</p>
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
                  {format(new Date(receipt.issuedAt), 'PPP')}
                </p>
              </div>
              <div className='space-y-2'>
                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <Calendar className='h-4 w-4' />
                  Created
                </div>
                <p className='font-medium'>
                  {format(new Date(receipt.createdAt), 'PPP')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Recipient Information */}
            <div className='space-y-4'>
              <h3 className='font-semibold flex items-center gap-2'>
                <User className='h-4 w-4' />
                Recipient Information
              </h3>
              <div className='space-y-2 bg-gray-50 p-4 rounded-lg'>
                <div className='flex justify-between'>
                  <span>Received By:</span>
                  <span className='font-medium'>
                    {receipt.receivedBy || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Invoice Information */}
            <div className='space-y-4'>
              <h3 className='font-semibold flex items-center gap-2'>
                <FileText className='h-4 w-4' />
                Invoice Information
              </h3>
              <div className='space-y-2 bg-blue-50 p-4 rounded-lg'>
                <div className='flex justify-between'>
                  <span>Invoice Number:</span>
                  <span className='font-medium'>#{receipt.invoice._id}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Invoice Amount:</span>
                  <span className='font-medium'>
                    {formatToGMD(receipt.invoice.totalAmount)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Invoice Status:</span>
                  <span className='font-medium'>{receipt.invoice.status}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {receipt.notes && (
              <>
                <Separator />
                <div className='space-y-4'>
                  <h3 className='font-semibold'>Notes</h3>
                  <div className='bg-gray-50 p-4 rounded-lg'>
                    <p className='text-sm text-gray-700'>{receipt.notes}</p>
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <div className='text-xs text-gray-500 space-y-1'>
              <p>Created: {format(new Date(receipt.createdAt), 'PPP p')}</p>
              <p>Updated: {format(new Date(receipt.updatedAt), 'PPP p')}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 pt-4 border-t'>
          {onDownloadPDF && (
            <Button
              variant='outline'
              onClick={() => onDownloadPDF(receipt._id)}
              className='flex-1'
            >
              <Download className='h-4 w-4 mr-2' />
              Download PDF
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ReceiptDetailsSheet;
