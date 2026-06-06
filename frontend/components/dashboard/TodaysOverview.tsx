'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { useDailyOverview } from '@/hooks/useAdminDashboardQueries';
import { Skeleton } from '../ui/skeleton';

interface TodaysOverviewProps {
  data?: {
    newBookings: number;
    completedBookings: number;
    inProgressBookings: number;
    revenueToday: number;
  };
  isLoading?: boolean;
  isError?: boolean;
  error?: any;
}

const TodaysOverview: React.FC<TodaysOverviewProps> = ({
  data,
  isLoading: externalLoading,
  isError: externalError,
  error: externalErrorData,
}) => {
  // Use internal hook if no external data provided (for backward compatibility)
  const {
    data: internalData,
    isFetching: internalLoading,
    isError: internalError,
    error: internalErrorData,
  } = useDailyOverview();

  const dailyOverview = data ?? internalData;
  const isLoading = externalLoading ?? internalLoading;
  const isError = externalError ?? internalError;
  const error = externalErrorData ?? internalErrorData;

  if (isLoading) {
    return (
      <Card className='bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm text-white'>
        <CardHeader>
          <h3 className='text-lg font-bold mb-4'>Today's Overview</h3>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='w-full flex justify-between items-center flex-row gap-16'>
            <Skeleton className='h-6 w-32 flex-1 bg-blue-400 rounded animate-pulse' />
            <Skeleton className='h-6 w-6 bg-blue-400 rounded-full animate-pulse' />
          </div>
          <div className='w-full flex justify-between items-center flex-row gap-16'>
            <Skeleton className='h-6 w-32 flex-1 bg-blue-400 rounded animate-pulse' />
            <Skeleton className='h-6 w-6 bg-blue-400 rounded-full animate-pulse' />
          </div>
          <div className='w-full flex justify-between items-center flex-row gap-16'>
            <Skeleton className='h-6 w-32 flex-1 bg-blue-400 rounded animate-pulse' />
            <Skeleton className='h-6 w-6 bg-blue-400 rounded-full animate-pulse' />
          </div>
        </CardContent>
        <CardFooter className='w-full flex justify-start flex-col border-t border-blue-400'>
          <Skeleton className='h-6 w-24 bg-blue-400 rounded animate-pulse mb-2' />
          <Skeleton className='h-8 w-32 bg-blue-400 rounded animate-pulse' />
        </CardFooter>
      </Card>
    );
  }

  if (isError) {
    console.error('Error loading daily overview:', error);
  }

  return (
    <Card className='bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm text-white'>
      <CardHeader>
        <h3 className='text-lg font-bold mb-4'>Today's Overview</h3>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-blue-100'>New Bookings</span>
          <span className='text-2xl font-bold'>
            {dailyOverview?.newBookings ?? 0}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-blue-100'>Completed</span>
          <span className='text-2xl font-bold'>
            {dailyOverview?.completedBookings ?? 0}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-blue-100'>In Progress</span>
          <span className='text-2xl font-bold'>
            {dailyOverview?.inProgressBookings ?? 0}
          </span>
        </div>
      </CardContent>
      <CardFooter className='w-full flex justify-start flex-col border-t border-blue-400'>
        <span className='text-blue-100'>Revenue Today</span>
        <span className='text-xl font-bold'>
          GMD {dailyOverview?.revenueToday ?? 0}
        </span>
      </CardFooter>
    </Card>
  );
};

export default TodaysOverview;
