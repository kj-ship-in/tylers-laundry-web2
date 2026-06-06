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
  Shield,
  UserCheck,
  UserX,
  Edit,
  Trash2,
} from 'lucide-react';

interface StaffDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  staff: User | null;
  onEdit?: (staff: User) => void;
  onDelete?: (staffId: string) => void;
  onToggleStatus?: (staffId: string, isActive: boolean) => void;
}

export const StaffDetailsSheet: React.FC<StaffDetailsSheetProps> = ({
  isOpen,
  onClose,
  staff,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  if (!staff) return null;

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
          <SheetTitle>Staff Details</SheetTitle>
          <SheetDescription>
            View and manage staff member information
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* Profile Section */}
          <div className='flex items-center space-x-4'>
            <div className='h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center'>
              <span className='text-lg font-semibold text-gray-600'>
                {getInitials(staff.name)}
              </span>
            </div>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {staff.name}
              </h3>
              <p className='text-sm text-gray-500'>{staff.email}</p>
              <div className='flex items-center space-x-2 mt-1'>
                <Badge
                  className={
                    staff.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {staff.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge
                  className={
                    staff.isVerified
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {staff.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-gray-900 flex items-center'>
              <Shield className='h-4 w-4 mr-2' />
              Contact Information
            </h4>

            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <Mail className='h-4 w-4 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900'>Email</p>
                  <p className='text-sm text-gray-600'>{staff.email}</p>
                </div>
              </div>

              {staff.phone && (
                <div className='flex items-center space-x-3'>
                  <Phone className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm font-medium text-gray-900'>Phone</p>
                    <p className='text-sm text-gray-600'>{staff.phone}</p>
                  </div>
                </div>
              )}

              {staff.address && (
                <div className='flex items-center space-x-3'>
                  <MapPin className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm font-medium text-gray-900'>Address</p>
                    <p className='text-sm text-gray-600'>{staff.address}</p>
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
                    {format(new Date(staff.createdAt), 'PPP')}
                  </p>
                </div>
              </div>

              {staff.lastLogin && (
                <div className='flex items-center space-x-3'>
                  <Calendar className='h-4 w-4 text-gray-400' />
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      Last Login
                    </p>
                    <p className='text-sm text-gray-600'>
                      {format(new Date(staff.lastLogin), 'PPP')}
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
              {onEdit && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => onEdit(staff)}
                  className='justify-start'
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Edit Staff
                </Button>
              )}

              {onToggleStatus && (
                <Button
                  variant={staff.isActive ? 'destructive' : 'default'}
                  size='sm'
                  onClick={() => onToggleStatus(staff._id, !staff.isActive)}
                  className='justify-start'
                >
                  {staff.isActive ? (
                    <>
                      <UserX className='h-4 w-4 mr-2' />
                      Deactivate Staff
                    </>
                  ) : (
                    <>
                      <UserCheck className='h-4 w-4 mr-2' />
                      Activate Staff
                    </>
                  )}
                </Button>
              )}

              {onDelete && (
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => onDelete(staff._id)}
                  className='justify-start'
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete Staff
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
