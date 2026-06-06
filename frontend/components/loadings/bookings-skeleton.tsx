import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface BookingsSkeletonProps {
  count?: number;
}

export const BookingsSkeleton: React.FC<BookingsSkeletonProps> = ({
  count = 5,
}) => {
  return (
    <div className='space-y-4'>
      {[...Array(count)].map((_, index) => (
        <div key={index} className='p-4 border rounded-lg'>
          <div className='flex justify-between items-start'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-3 w-20' />
            </div>
            <div className='text-right space-y-2'>
              <Skeleton className='h-4 w-16 ml-auto' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
