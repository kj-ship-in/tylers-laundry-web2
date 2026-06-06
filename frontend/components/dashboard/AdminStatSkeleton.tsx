import React from 'react';

export const AdminStatSkeleton: React.FC = () => {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='w-12 h-12 bg-gray-200 rounded-lg animate-pulse' />
        <div className='w-16 h-6 bg-gray-200 rounded animate-pulse' />
      </div>
      <div className='space-y-3'>
        <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
        <div className='h-8 w-32 bg-gray-200 rounded animate-pulse' />
      </div>
    </div>
  );
};
