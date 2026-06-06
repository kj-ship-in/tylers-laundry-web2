'use client';

import type { ReactNode } from 'react';
import React from 'react';
import { getMenuByRole } from '@/mocks/role-based-menu';
import { LogOut, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../svgs/Logo';
import { useSession, signOut } from 'next-auth/react';

type SidebarProps = {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarOpen: boolean;
};

/**
 * Unified Sidebar Component with Complete Role-Based Logic
 * - Automatically loads correct menu based on user role (ADMIN, STAFF, USER)
 * - Single component handles all role variants
 * - Gets user session and applies role-based logic
 * - Includes layout configuration and permission guards
 */
const Sidebar = ({ setSidebarOpen, sidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  // Get menu items based on user role (returns different menu for each role)
  const menuItems = getMenuByRole(userRole);

  // Role-based layout configurations
  const getLayoutConfig = (role?: string) => {
    switch (role) {
      case 'USER':
        return {
          showSidebar: true,
          headerTitle: 'My Account',
          theme: 'light',
          maxWidth: 'max-w-4xl',
        };
      case 'STAFF':
        return {
          showSidebar: true,
          headerTitle: 'Staff Panel',
          theme: 'dark',
          maxWidth: 'max-w-7xl',
        };
      case 'ADMIN':
        return {
          showSidebar: true,
          headerTitle: 'Admin Panel',
          theme: 'dark',
          maxWidth: 'max-w-full',
        };
      default:
        return {
          showSidebar: false,
          headerTitle: 'Welcome',
          theme: 'light',
          maxWidth: 'max-w-4xl',
        };
    }
  };

  const layoutConfig = getLayoutConfig(userRole);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Only show sidebar for ADMIN and STAFF roles
  if (!layoutConfig.showSidebar) {
    return null;
  }

  return (
    <aside
      className={`w-64 bg-linear-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 fixed h-full z-50 
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Sidebar Header */}
      <div className='p-4 border-b border-gray-700'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-10 flex items-center justify-center'>
              <Logo />
            </div>
            <div className='hidden sm:block'>
              <h2 className='font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent text-lg'>
                Tyler&apos;s Laundry
              </h2>
              <p className='text-xs text-gray-400'>
                {userRole === 'ADMIN' && 'Admin Panel'}
                {userRole === 'STAFF' && 'Staff Panel'}
                {userRole === 'USER' && 'Customer'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className='p-2 hover:bg-gray-700 rounded-lg transition lg:hidden'
            title='Close sidebar'
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Role-Based Navigation Menu */}
      <nav className='p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]'>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={20} />
              <span className='font-medium'>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className='absolute bottom-4 left-4 right-4'>
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition'
          title='Logout'
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

/**
 * Permission-based component visibility guard
 * Only shows children if user has required permission
 */
export const PermissionGuard: React.FC<{
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}> = ({ children, permission, fallback = null }) => {
  const { data: session } = useSession();
  const userPermissions = (session?.user as any)?.permissions ?? [];
  const hasPermission = userPermissions.includes(permission);

  if (!hasPermission) {
    return fallback;
  }

  return children;
};

/**
 * Role-based page access control
 * Only shows children if user has required role
 */
export const RoleGuard: React.FC<{
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}> = ({ children, allowedRoles, fallback }) => {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      fallback ?? (
        <div className='text-center py-12'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
            Access Denied
          </h2>
          <p className='text-gray-600'>
            You don't have permission to access this page.
          </p>
        </div>
      )
    );
  }

  return children;
};

export default Sidebar;
