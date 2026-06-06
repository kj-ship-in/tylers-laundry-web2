import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfileOverviewSkeleton: React.FC = () => {
  return (
    <div className='mb-8 p-6 bg-gray-50 rounded-lg'>
      <div className='flex items-center gap-6'>
        <Skeleton className='w-20 h-20 rounded-full' />
        <div className='flex-1 space-y-3'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-64' />
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-4 w-32' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-4 w-28' />
            </div>
            <div className='sm:col-span-2 space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-full' />
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-3 w-32' />
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfileFormSkeleton: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-24 w-full' />
        </div>
      </div>
      <div className='flex justify-end'>
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
};

export const PasswordFormSkeleton: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-28' />
        <Skeleton className='h-10 w-full' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-10 w-full' />
      </div>
      <div className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-10 w-full' />
      </div>
      <div className='flex justify-end'>
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
};

export const PictureUploadSkeleton: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-6'>
        <Skeleton className='w-24 h-24 rounded-full' />
        <div className='space-y-4'>
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-10 w-32' />
        </div>
      </div>
      <Skeleton className='h-16 w-full' />
    </div>
  );
};

export const SettingsPageSkeleton: React.FC = () => {
  return (
    <div className='container mx-auto pb-8'>
      <div className='mb-8'>
        <Skeleton className='h-9 w-32 mb-2' />
        <Skeleton className='h-5 w-64' />
      </div>

      <div className='space-y-6'>
        <Skeleton className='h-12 w-full' />

        <div className='space-y-4'>
          <Skeleton className='h-8 w-20' />
          <Skeleton className='h-4 w-48' />

          <div className='space-y-6'>
            <ProfileOverviewSkeleton />
            <ProfileFormSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfileTabSkeleton: React.FC = () => {
  return (
    <div className='space-y-6'>
      <ProfileOverviewSkeleton />
      <ProfileFormSkeleton />
    </div>
  );
};

export const PasswordTabSkeleton: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-4 w-64' />
      </div>
      <PasswordFormSkeleton />
    </div>
  );
};

export const PictureTabSkeleton: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-4 w-64' />
      </div>
      <PictureUploadSkeleton />
    </div>
  );
};
