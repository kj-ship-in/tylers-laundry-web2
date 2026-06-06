'use client';

import Header from '@/components/layout/header';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { redirect, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/layout/sidebar';

type AdminLayoutProps = {
  children: ReactNode;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile by default
  const pathname = usePathname();

  const { data: session } = useSession();

  if (!session) {
    redirect('/');
  }

  const getPageTitle = (pathname: string) => {
    const segments = pathname.split('/');
    const lastSegment = segments[segments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  const pageTitle = getPageTitle(pathname);
  const subtitle =
    pageTitle === 'Dashboard'
      ? `Welcome back, ${(session?.user as any)?.name ?? 'User'}`
      : undefined;

  return (
    <div className='min-h-screen bg-gray-50 flex relative'>
      <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className='flex-1 transition-all duration-300 lg:ml-64 ml-0'>
        <Header
          title={pageTitle}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className='p-3 sm:p-4 lg:p-6'>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
