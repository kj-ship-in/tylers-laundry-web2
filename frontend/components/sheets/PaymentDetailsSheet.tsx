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
import type {
  PaymentResponse,
  PaymentStatus,
  PaymentMethod,
} from '@/types/payment';
import {
  CreditCard,
  Calendar,
  DollarSign,
  Hash,
  Trash2,
  RefreshCw,
  Receipt,
  FileText,
} from 'lucide-react';

interface PaymentDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentResponse | null;
  onDelete?: (paymentId: number) => void;
  onProcess?: (paymentId: number) => void;
  onRefund?: (paymentId: number, reason?: string) => void;
}

const PaymentDetailsSheet: React.FC<PaymentDetailsSheetProps> = ({
  isOpen,
  onClose,
  payment,
  onDelete,
  onProcess,
  onRefund,
}) => {
  if (!payment) return null;

  const getStatusBadgeVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodBadgeVariant = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return 'bg-green-100 text-green-800';
      case 'WAVE':
        return 'bg-blue-100 text-blue-800';
      case 'APS':
        return 'bg-purple-100 text-purple-800';
      case 'BANK':
        return 'bg-orange-100 text-orange-800';
      case 'YONNA':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-2xl flex flex-col'>
        <SheetHeader className='shrink-0'>
          <SheetTitle>Payment Details</SheetTitle>
          <SheetDescription>
            View payment transaction information
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto mt-6'>
          <div className='space-y-6 pr-2'>
            {/* Payment Header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <div className='h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center'>
                  <CreditCard className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    {payment.currency} {Number(payment.amount).toFixed(2)}
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Transaction #{payment.transactionId}
                  </p>
                </div>
              </div>
              <div className='flex flex-col items-end space-y-1'>
                <Badge className={getStatusBadgeVariant(payment.status)}>
                  {payment.status}
                </Badge>
                <Badge className={getMethodBadgeVariant(payment.method)}>
                  {payment.method}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Left Column */}
              <div className='space-y-6'>
                {/* Transaction Details */}
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium text-gray-900 flex items-center'>
                    <FileText className='h-4 w-4 mr-2' />
                    Transaction Details
                  </h4>

                  <div className='space-y-3'>
                    <div className='flex items-center space-x-3'>
                      <Hash className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          Payment ID
                        </p>
                        <p className='text-sm text-gray-600'>#{payment._id}</p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <Hash className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          Transaction ID
                        </p>
                        <p className='text-sm text-gray-600 font-mono'>
                          {payment.transactionId}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <DollarSign className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          Amount
                        </p>
                        <p className='text-sm text-gray-600'>
                          {payment.currency} {Number(payment.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {payment.gatewayResponse && (
                      <div className='flex items-center space-x-3'>
                        <FileText className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Gateway Response
                          </p>
                          <p className='text-sm text-gray-600'>
                            {payment.gatewayResponse}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium text-gray-900 flex items-center'>
                    <Calendar className='h-4 w-4 mr-2' />
                    Timestamps
                  </h4>

                  <div className='space-y-3'>
                    <div className='flex items-center space-x-3'>
                      <Calendar className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          Created
                        </p>
                        <p className='text-sm text-gray-600'>
                          {format(new Date(payment.createdAt), 'PPP')}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-3'>
                      <Calendar className='h-4 w-4 text-gray-400' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          Last Updated
                        </p>
                        <p className='text-sm text-gray-600'>
                          {format(new Date(payment.updatedAt), 'PPP')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className='space-y-6'>
                {/* Booking Information */}
                {payment.booking && (
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium text-gray-900 flex items-center'>
                      <Receipt className='h-4 w-4 mr-2' />
                      Booking Information
                    </h4>

                    <div className='space-y-3'>
                      <div className='flex items-center space-x-3'>
                        <Hash className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Booking ID
                          </p>
                          <p className='text-sm text-gray-600'>
                            #{payment.booking._id}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center space-x-3'>
                        <FileText className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Service
                          </p>
                          <p className='text-sm text-gray-600'>
                            {payment.booking.service?.type}
                          </p>
                          {payment.booking.service?.description && (
                            <p className='text-xs text-gray-500'>
                              {payment.booking.service.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoice Information */}
                {payment.invoice && (
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium text-gray-900 flex items-center'>
                      <Receipt className='h-4 w-4 mr-2' />
                      Invoice Information
                    </h4>

                    <div className='space-y-3'>
                      <div className='flex items-center space-x-3'>
                        <Hash className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Invoice No
                          </p>
                          <p className='text-sm text-gray-600'>
                            {payment.invoice.invoiceNo}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center space-x-3'>
                        <DollarSign className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Total Amount
                          </p>
                          <p className='text-sm text-gray-600'>
                            {payment.currency}{' '}
                            {Number(payment.invoice.totalAmount).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center space-x-3'>
                        <Calendar className='h-4 w-4 text-gray-400' />
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            Due Date
                          </p>
                          <p className='text-sm text-gray-600'>
                            {format(new Date(payment.invoice.dueDate), 'PPP')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions - Full Width */}
            <div className='space-y-3'>
              <h4 className='text-sm font-medium text-gray-900'>Actions</h4>
              <div className='flex flex-col space-y-2'>
                {payment.status === 'PENDING' && onProcess && (
                  <Button
                    variant='default'
                    size='sm'
                    onClick={() => onProcess(payment._id)}
                    className='justify-start'
                  >
                    <CreditCard className='h-4 w-4 mr-2' />
                    Process Payment
                  </Button>
                )}

                {payment.status === 'PAID' && onRefund && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      const reason = prompt('Enter refund reason (optional):');
                      onRefund(payment._id, reason ?? undefined);
                    }}
                    className='justify-start text-orange-600 border-orange-200 hover:bg-orange-50'
                  >
                    <RefreshCw className='h-4 w-4 mr-2' />
                    Refund Payment
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => onDelete(payment._id)}
                    className='justify-start'
                  >
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentDetailsSheet;
