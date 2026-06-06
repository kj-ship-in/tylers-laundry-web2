'use client';

import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useCurrentUser } from '@/hooks/useUserQuery';
import { Skeleton } from '@/components/ui/skeleton';

type HeaderProps = {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
};

const Header = ({ title, subtitle, onMenuClick }: HeaderProps) => {
  const { data: session } = useSession();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const user = currentUser ?? (session?.user as any);

  const userProfile = user.profileUrl
    ? `/api/images${user.profileUrl}`
    : undefined;

  return (
    <header className='bg-white border-b border-gray-200 sticky top-0 z-30'>
      <div className='px-3 sm:px-4 lg:px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={onMenuClick}
              className='p-2 hover:bg-gray-100 rounded-lg transition lg:hidden'
              title='Open sidebar'
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className='text-lg sm:text-xl lg:text-2xl font-bold text-gray-900'>
                {title}
              </h1>
              {subtitle && (
                <p className='text-gray-500 text-xs sm:text-sm'>{subtitle}</p>
              )}
            </div>
          </div>
          <div className='flex items-center gap-2 sm:gap-4'>
            <div className='relative hidden sm:block'>
              <input
                type='text'
                placeholder='Search...'
                className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 sm:w-48 lg:w-64'
              />
              <Search
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={20}
              />
            </div>
            <button
              title='Notifications'
              className='relative p-2 hover:bg-gray-100 rounded-lg transition'
            >
              <Bell size={18} className='sm:w-5 sm:h-5' />
              <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full' />
            </button>
            <div className='flex items-center gap-2 sm:gap-3'>
              {isLoadingUser ? (
                <>
                  <Skeleton className='w-8 h-8 sm:w-10 sm:h-10 rounded-full' />
                  <div className='hidden md:block space-y-1'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-3 w-32' />
                  </div>
                </>
              ) : userProfile ? (
                <Image
                  src={userProfile}
                  alt='User'
                  width={40}
                  height={40}
                  className='w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover'
                />
              ) : (
                <div className='w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-blue-400 to-orange-400 rounded-full' />
              )}
              {!isLoadingUser && (
                <div className='hidden md:block'>
                  <p className='font-medium text-sm'>{user?.name ?? 'User'}</p>
                  <p className='text-xs text-gray-500'>{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
