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
import type { User } from '@/types/user';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User as UserIcon,
  Trash2,
} from 'lucide-react';

interface CustomerDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  customer: User | null;
  onDelete?: (customerId: string) => void;
}

export const CustomerDetailsSheet: React.FC<CustomerDetailsSheetProps> = ({
  isOpen,
  onClose,
  customer,
  onDelete,
}) => {
  if (!customer) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Customer Details</SheetTitle>
          <SheetDescription>View customer information</SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* Profile Section */}
          <div className='flex items-center space-x-4'>
            <div className='h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center'>
              <span className='text-lg font-semibold text-gray-600'>
                {getInitials(customer.name)}
              </span>
            </div>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {customer.name}
              </h3>
              <p className='text-sm text-gray-500'>{customer.email}</p>
              <div className='flex items-center space-x-2 mt-1'>
                <Badge
                  className={
                    customer.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge
                  className={
                    customer.isVerified
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {customer.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-gray-900 flex items-center'>
              <UserIcon className='h-4 w-4 mr-2' />
              Contact Information
            </h4>

            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <Mail className='h-4 w-4 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Email</p>
                  <p className='text-sm text-gray-600'>{customer.email}</p>
                </div>
              </div>

              {customer.phone && (
                <div className='flex items-center space-x-3'>
                  <Phone className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm font-medium text-gray-900'>Phone</p>
                    <p className='text-sm text-gray-600'>{customer.phone}</p>
                  </div>
                </div>
              )}

              {customer.address && (
                <div className='flex items-center space-x-3'>
                  <MapPin className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm font-medium text-gray-900'>Address</p>
                    <p className='text-sm text-gray-600'>{customer.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Account Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-gray-900 flex items-center'>
              <Calendar className='h-4 w-4 mr-2' />
              Account Information
            </h4>

            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <Calendar className='h-4 w-4 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Joined</p>
                  <p className='text-sm text-gray-600'>
                    {format(new Date(customer.createdAt), 'PPP')}
                  </p>
                </div>
              </div>

              {customer.lastLogin && (
                <div className='flex items-center space-x-3'>
                  <Calendar className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      Last Login
                    </p>
                    <p className='text-sm text-gray-600'>
                      {format(new Date(customer.lastLogin), 'PPP')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className='space-y-3'>
            <h4 className='text-sm font-medium text-gray-900'>Actions</h4>
            <div className='flex flex-col space-y-2'>
              {onDelete && (
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => onDelete(customer._id)}
                  className='justify-start'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete Customer
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
