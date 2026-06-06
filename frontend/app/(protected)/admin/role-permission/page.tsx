'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { UserRole } from '@/utils/api-client';
import type { Permission } from '@/types/permission';
import { ALL_PERMISSIONS } from '@/types/permission';
import { usePermissions } from '@/hooks/usePermissions';
import NoData from '@/components/no -data';
import { Users } from 'lucide-react';
import { useRoles, useAssignPermissionsToRole } from '@/hooks/useRoleQueries';
import { useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';

type RoleOption = 'ALL' | UserRole;

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

const RolePermissionSkeleton = () => (
  <div className='space-y-6'>
    <div className='flex items-center justify-between bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100'>
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-48' />
      </div>
      <Skeleton className='h-9 w-24 hidden md:block' />
    </div>

    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
      <div className='lg:col-span-2'>
        <Card className='shadow-lg border-0 bg-white'>
          <CardHeader className='bg-linear-to-r from-gray-50 to-gray-100 border-b px-6 py-4'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-9 w-32' />
            </div>
          </CardHeader>
          <CardContent className='p-6 space-y-8'>
            {[...Array(4)].map((_, i) => (
              <div key={i} className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-[18px] w-[18px] rounded' />
                  <Skeleton className='h-5 w-36' />
                  <Skeleton className='h-5 w-10 rounded-full' />
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-1 pl-7 border-l-2 border-gray-100 ml-[9px]'>
                  {[...Array(i % 2 === 0 ? 6 : 4)].map((_, j) => (
                    <div
                      key={j}
                      className='flex items-center gap-3 px-3 py-2.5'
                    >
                      <Skeleton className='h-[18px] w-[18px] rounded shrink-0' />
                      <Skeleton
                        className='h-4'
                        style={{ width: `${55 + ((j * 17) % 35)}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className='shadow-lg border-0 bg-white'>
          <CardHeader className='bg-linear-to-r from-gray-50 to-gray-100 border-b px-6 py-4'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48 mt-1' />
          </CardHeader>
          <CardContent className='p-4 space-y-2'>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-3 p-3 border rounded-lg'
              >
                <Skeleton className='h-9 w-9 rounded-full shrink-0' />
                <div className='flex-1 space-y-1.5'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
                <Skeleton className='h-6 w-14 rounded-full shrink-0' />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

const PermissionsSkeleton = () => (
  <div className='space-y-8'>
    {[...Array(4)].map((_, i) => (
      <div key={i} className='space-y-3'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-[18px] w-[18px] rounded' />
          <Skeleton className='h-5 w-36' />
          <Skeleton className='h-5 w-10 rounded-full' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-1 pl-7 border-l-2 border-gray-100 ml-[9px]'>
          {[...Array(i % 2 === 0 ? 6 : 4)].map((_, j) => (
            <div key={j} className='flex items-center gap-3 px-3 py-2.5'>
              <Skeleton className='h-[18px] w-[18px] rounded shrink-0' />
              <Skeleton
                className='h-4'
                style={{ width: `${55 + ((j * 17) % 35)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const RolePermissionPage = () => {
  const { hasPermission } = usePermissions();
  const [selectedRole, setSelectedRole] = useState<RoleOption>('ALL');
  const [customPermissions, setCustomPermissions] =
    useState<Set<string> | null>(null);

  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useRoles();

  const [permissionsData, setPermissionsData] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const response = await fetch('/api/permissions');
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const data = await response.json();
      setPermissionsData(data.data);
    } catch {
      // falls back to ALL_PERMISSIONS
    } finally {
      setPermissionsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const allUsers = useMemo(() => {
    if (!rolesResponse) return [];
    const users: User[] = [];
    rolesResponse.forEach(role => {
      if (role.users) {
        role.users.forEach(user => {
          users.push({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: role.name as UserRole,
            isActive: true,
          });
        });
      }
    });
    return users;
  }, [rolesResponse]);

  const filteredUsers = useMemo(() => {
    if (selectedRole === 'ALL') return allUsers;
    return allUsers.filter(user => user.role === selectedRole);
  }, [allUsers, selectedRole]);

  const assignPermissionsMutation = useAssignPermissionsToRole();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (assignPermissionsMutation.isSuccess) {
      toast.success('Permissions updated successfully!');
      setCustomPermissions(null);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      }, 1000);
    }
  }, [assignPermissionsMutation.isSuccess, queryClient]);

  useEffect(() => {
    if (assignPermissionsMutation.isError) {
      toast.error('Failed to update permissions. Please try again.');
      assignPermissionsMutation.reset();
    }
  }, [assignPermissionsMutation.isError]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (assignPermissionsMutation.isPending) {
      timeoutId = setTimeout(() => {
        assignPermissionsMutation.reset();
        toast.error('Request timed out. Please try again.');
      }, 30000);
    }
    return () => clearTimeout(timeoutId);
  }, [assignPermissionsMutation.isPending]);

  const handleRefreshRoles = () => {
    refetchRoles();
    fetchPermissions();
    toast.info('Refreshing data...');
  };

  const rolePermissions = useMemo(() => {
    if (selectedRole === 'ALL') return new Set<string>();
    const roleData = rolesResponse?.find(role => role.name === selectedRole);
    return new Set(roleData?.permissions ?? []);
  }, [selectedRole, rolesResponse]);

  const activePermissions = customPermissions ?? rolePermissions;
  const isDisabled =
    selectedRole === 'ALL' || assignPermissionsMutation.isPending;

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    const newPermissions = new Set(activePermissions);
    if (checked) newPermissions.add(permission);
    else newPermissions.delete(permission);
    setCustomPermissions(newPermissions);
  };

  const handleCategoryToggle = (categoryPerms: string[], checked: boolean) => {
    const newPermissions = new Set(activePermissions);
    if (checked) categoryPerms.forEach(p => newPermissions.add(p));
    else categoryPerms.forEach(p => newPermissions.delete(p));
    setCustomPermissions(newPermissions);
  };

  const handleSavePermissions = () => {
    if (selectedRole === 'ALL' || assignPermissionsMutation.isPending) return;
    const roleData = rolesResponse?.find(role => role.name === selectedRole);
    if (!roleData) {
      toast.error('Selected role not found. Please refresh and try again.');
      return;
    }
    assignPermissionsMutation.mutate({
      id: roleData._id,
      data: {
        permissions: Array.from(
          customPermissions ?? rolePermissions,
        ) as Permission[],
      },
    });
  };

  const handleSelectAll = () => {
    const all = permissionsData.length > 0 ? permissionsData : ALL_PERMISSIONS;
    setCustomPermissions(new Set(all));
  };

  const handleDeselectAll = () => setCustomPermissions(new Set());

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, string[]> = {
      'User Management': [],
      'Profile Management': [],
      'Booking Management': [],
      'Service Management': [],
      'Payment Management': [],
      'Invoice Management': [],
      'Receipt Management': [],
      'Testimonial Management': [],
      'Analytics & Reports': [],
      'PDF Generation': [],
      Settings: [],
      'Staff Management': [],
      'Role Management': [],
    };

    const permissionsToGroup =
      permissionsData.length > 0 ? permissionsData : ALL_PERMISSIONS;

    permissionsToGroup.forEach((permission: string) => {
      if (permission.startsWith('USER_'))
        groups['User Management'].push(permission);
      else if (permission.startsWith('PROFILE_'))
        groups['Profile Management'].push(permission);
      else if (permission.startsWith('BOOKING_'))
        groups['Booking Management'].push(permission);
      else if (permission.startsWith('SERVICE_'))
        groups['Service Management'].push(permission);
      else if (permission.startsWith('PAYMENT_'))
        groups['Payment Management'].push(permission);
      else if (permission.startsWith('INVOICE_'))
        groups['Invoice Management'].push(permission);
      else if (permission.startsWith('RECEIPT_'))
        groups['Receipt Management'].push(permission);
      else if (permission.startsWith('TESTIMONIAL_'))
        groups['Testimonial Management'].push(permission);
      else if (
        permission.startsWith('ANALYTICS_') ||
        permission.startsWith('REPORTS_')
      )
        groups['Analytics & Reports'].push(permission);
      else if (permission.startsWith('PDF_'))
        groups['PDF Generation'].push(permission);
      else if (permission.startsWith('SETTINGS_'))
        groups['Settings'].push(permission);
      else if (permission.startsWith('STAFF_'))
        groups['Staff Management'].push(permission);
      else if (
        permission.startsWith('ROLE_') ||
        permission.startsWith('PERMISSION_')
      )
        groups['Role Management'].push(permission);
    });

    return groups;
  }, [permissionsData]);

  if (!hasPermission('role:view')) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            Access Denied
          </h2>
          <p className='text-gray-600'>
            You don't have permission to manage roles and permissions.
          </p>
        </div>
      </div>
    );
  }

  if (rolesLoading) return <RolePermissionSkeleton />;

  if (rolesError) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-600 mb-2'>
            Failed to Load Roles
          </h2>
          <p className='text-gray-600 mb-4'>
            There was an error loading the roles data.
          </p>
          <Button onClick={handleRefreshRoles} variant='outline'>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-1'>
            Role & Permission Management
          </h1>
          <p className='text-gray-600'>
            Manage user roles and their associated permissions
          </p>
        </div>
        <div className='hidden md:flex items-center gap-3'>
          <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
            <svg
              className='w-6 h-6 text-blue-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
              />
            </svg>
          </div>
          <Button variant='outline' size='sm' onClick={handleRefreshRoles}>
            <svg
              className='w-4 h-4 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Permissions Panel */}
        <div className='lg:col-span-2'>
          <Card className='shadow-lg border-0 bg-white'>
            <CardHeader className='bg-linear-to-r from-gray-50 to-gray-100 border-b px-6 py-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <CardTitle className='text-xl font-semibold text-gray-900'>
                  Permissions
                </CardTitle>
                <div className='flex flex-wrap items-center gap-2'>
                  <Select
                    value={selectedRole}
                    onValueChange={(value: RoleOption) => {
                      setSelectedRole(value);
                      setCustomPermissions(null);
                    }}
                  >
                    <SelectTrigger className='w-36'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ALL'>All Roles</SelectItem>
                      {rolesResponse?.map(role => (
                        <SelectItem key={role._id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                      {(!rolesResponse || rolesResponse.length === 0) && (
                        <SelectItem value='loading' disabled>
                          No roles found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {selectedRole !== 'ALL' && (
                    <>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleSelectAll}
                        disabled={assignPermissionsMutation.isPending}
                        className='hover:bg-blue-50 hover:border-blue-300'
                      >
                        Select All
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleDeselectAll}
                        disabled={assignPermissionsMutation.isPending}
                        className='hover:bg-red-50 hover:border-red-300'
                      >
                        Deselect All
                      </Button>
                      <Button
                        onClick={handleSavePermissions}
                        disabled={assignPermissionsMutation.isPending}
                        size='sm'
                      >
                        {assignPermissionsMutation.isPending
                          ? 'Saving...'
                          : 'Save Changes'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className='p-6'>
              {permissionsLoading ? (
                <PermissionsSkeleton />
              ) : (
                <div className='space-y-6'>
                  {Object.entries(groupedPermissions).map(
                    ([category, permissions]) => {
                      if (permissions.length === 0) return null;

                      const checkedCount = permissions.filter(p =>
                        activePermissions.has(p),
                      ).length;
                      const allChecked = checkedCount === permissions.length;
                      const someChecked = checkedCount > 0 && !allChecked;

                      return (
                        <div key={category} className='space-y-2'>
                          {/* Category header with select-all checkbox */}
                          <div className='flex items-center gap-2.5'>
                            <Checkbox
                              checked={
                                allChecked
                                  ? true
                                  : someChecked
                                    ? 'indeterminate'
                                    : false
                              }
                              onCheckedChange={checked =>
                                handleCategoryToggle(permissions, !!checked)
                              }
                              disabled={isDisabled}
                              className='h-[18px] w-[18px]'
                            />
                            <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                              {category}
                            </h3>
                            <Badge
                              variant='outline'
                              className={`text-xs tabular-nums ${
                                selectedRole !== 'ALL' && checkedCount > 0
                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                  : 'text-gray-500'
                              }`}
                            >
                              {selectedRole !== 'ALL'
                                ? `${checkedCount} / ${permissions.length}`
                                : permissions.length}
                            </Badge>
                          </div>

                          {/* Permission rows */}
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-1 pl-7 ml-[9px] border-l-2 border-gray-100'>
                            {permissions.map(permission => {
                              const isChecked =
                                activePermissions.has(permission);
                              return (
                                <label
                                  key={permission}
                                  htmlFor={permission}
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors select-none ${
                                    isDisabled
                                      ? 'cursor-not-allowed opacity-60'
                                      : isChecked
                                        ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                                        : 'hover:bg-gray-50 cursor-pointer'
                                  }`}
                                >
                                  <Checkbox
                                    id={permission}
                                    checked={isChecked}
                                    onCheckedChange={checked =>
                                      handlePermissionToggle(
                                        permission,
                                        checked as boolean,
                                      )
                                    }
                                    disabled={isDisabled}
                                    className='h-[18px] w-[18px] shrink-0'
                                  />
                                  <span
                                    className={`text-sm leading-tight ${
                                      isChecked
                                        ? 'text-blue-900 font-medium'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {permission
                                      .replace(/_/g, ' ')
                                      .toLowerCase()
                                      .replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users Panel */}
        <div>
          <Card className='shadow-lg border-0 bg-white'>
            <CardHeader className='bg-linear-to-r from-gray-50 to-gray-100 border-b px-6 py-4'>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-xl font-semibold text-gray-900'>
                  {selectedRole === 'ALL' ? 'All Roles' : selectedRole}
                </CardTitle>
                {selectedRole !== 'ALL' && (
                  <Badge
                    variant='secondary'
                    className='bg-blue-100 text-blue-800'
                  >
                    {filteredUsers.length}
                  </Badge>
                )}
              </div>
              <p className='text-sm text-gray-500 mt-0.5'>
                {selectedRole === 'ALL'
                  ? 'Select a role to view users'
                  : 'Users assigned to this role'}
              </p>
            </CardHeader>
            <CardContent className='p-4'>
              {selectedRole === 'ALL' ? (
                <NoData
                  onRefresh={() => {}}
                  title='No Role Selected'
                  description='Select a specific role from the dropdown above to view users assigned to that role.'
                  icon={Users}
                  showRefresh={false}
                  compact
                />
              ) : filteredUsers.length === 0 ? (
                <NoData
                  onRefresh={() => {}}
                  title='No Users Found'
                  description='No users are currently assigned to this role.'
                  icon={Users}
                  showRefresh={false}
                  compact
                />
              ) : (
                <ScrollArea className='h-96'>
                  <div className='space-y-2 pr-2'>
                    {filteredUsers.map((user: User) => (
                      <div
                        key={user._id}
                        className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors'
                      >
                        <div className='flex items-center gap-3 min-w-0'>
                          <div className='w-9 h-9 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0'>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className='min-w-0'>
                            <p className='font-medium text-gray-900 text-sm truncate'>
                              {user.name}
                            </p>
                            <p className='text-xs text-gray-500 truncate'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`shrink-0 ml-2 ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionPage;
