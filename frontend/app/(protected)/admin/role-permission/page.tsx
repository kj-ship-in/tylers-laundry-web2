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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { UserRole } from '@/utils/api-client';
import { ROLE_PERMISSIONS, RoleManager } from '@/utils/api-client';
import type { Permission } from '@/types/permission';
import { ALL_PERMISSIONS } from '@/types/permission';
import { usePermissions } from '@/hooks/usePermissions';
import NoData from '@/components/no -data';
import { Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  useRoles,
  useRole,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useAssignPermissionsToRole,
  useAssignRoleToUser,
  useResetUserPermissions,
  useAddUserPermissions,
  useRemoveUserPermissions,
} from '@/hooks/useRoleQueries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';

type RoleOption = 'ALL' | UserRole;

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

const RolePermissionPage = () => {
  const { hasPermission } = usePermissions();
  const { data: session } = useSession();
  const [selectedRole, setSelectedRole] = useState<RoleOption>('ALL');
  const [customPermissions, setCustomPermissions] =
    useState<Set<string> | null>(null);

  // Fetch roles and permissions
  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
    refetch: refetchRoles,
  } = useRoles();

  // Fetch permissions directly from Next.js API
  const [permissionsData, setPermissionsData] = useState<string[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [permissionsError, setPermissionsError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setPermissionsLoading(true);
        const response = await fetch('/api/permissions');
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await response.json();
        setPermissionsData(data.data);
      } catch (error) {
        setPermissionsError(error as Error);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const allPermissionsResponse = permissionsData;

  console.log('🔑 Role Permission Page - Query states:', {
    rolesLoading,
    permissionsLoading,
    rolesError,
    permissionsError,
    rolesResponse,
    allPermissionsResponse,
    selectedRole,
    rolesCount: rolesResponse?.length,
    hasSession: !!session,
  });

  // Extract users from roles response
  const allUsers = React.useMemo(() => {
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
            isActive: true, // Assuming active if they're assigned to a role
          });
        });
      }
    });
    return users;
  }, [rolesResponse]);

  // Filter users by selected role
  const filteredUsers = React.useMemo(() => {
    if (selectedRole === 'ALL') return allUsers;
    return allUsers.filter(user => user.role === selectedRole);
  }, [allUsers, selectedRole]);

  // Mutations
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const assignPermissionsMutation = useAssignPermissionsToRole();
  const assignRoleToUserMutation = useAssignRoleToUser();
  const resetUserPermissionsMutation = useResetUserPermissions();
  const addUserPermissionsMutation = useAddUserPermissions();
  const removeUserPermissionsMutation = useRemoveUserPermissions();
  const queryClient = useQueryClient();

  // Handle successful permission assignment
  React.useEffect(() => {
    if (assignPermissionsMutation.isSuccess) {
      // Don't invalidate immediately to prevent UI flicker
      // Instead, just show success message and reset custom permissions
      toast.success('Permissions updated successfully!');
      setCustomPermissions(null); // Reset custom permissions

      // Refresh roles after a short delay to avoid UI flicker
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      }, 1000);
    }
  }, [assignPermissionsMutation.isSuccess, queryClient]);

  // Handle permission assignment error
  React.useEffect(() => {
    if (assignPermissionsMutation.isError) {
      console.error(
        '🔑 Permission assignment error:',
        assignPermissionsMutation.error,
      );
      toast.error('Failed to update permissions. Please try again.');
      // Reset loading state
      assignPermissionsMutation.reset();
    }
  }, [assignPermissionsMutation.isError, assignPermissionsMutation.error]);

  // Handle stuck mutations (timeout after 30 seconds)
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (assignPermissionsMutation.isPending) {
      timeoutId = setTimeout(() => {
        console.warn(
          '🔑 Permission assignment mutation timed out, resetting...',
        );
        assignPermissionsMutation.reset();
        toast.error('Request timed out. Please try again.');
      }, 30000); // 30 seconds
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [assignPermissionsMutation.isPending, assignPermissionsMutation]);

  const handleRefreshRoles = () => {
    console.log('🔑 handleRefreshRoles - Refreshing data...');
    refetchRoles();
    // Also refresh permissions
    const fetchPermissions = async () => {
      try {
        setPermissionsLoading(true);
        const response = await fetch('/api/permissions');
        if (!response.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await response.json();
        setPermissionsData(data.data);
      } catch (error) {
        setPermissionsError(error as Error);
      } finally {
        setPermissionsLoading(false);
      }
    };
    fetchPermissions();
    toast.info('Refreshing data...');
  };

  // Get permissions for selected role
  const rolePermissions = useMemo(() => {
    if (selectedRole === 'ALL') return new Set<string>();
    const roleData = rolesResponse?.find(role => role.name === selectedRole);
    return new Set(roleData?.permissions ?? []);
  }, [selectedRole, rolesResponse]);

  // Role ID mapping (if backend uses different IDs than expected)
  const getCorrectRoleId = (roleName: string): number | null => {
    const roleData = rolesResponse?.find(role => role.name === roleName);
    return roleData?._id || null;
  };

  const handlePermissionToggle = (permission: string, checked: boolean) => {
    const currentPermissions = customPermissions ?? new Set(rolePermissions);
    const newPermissions = new Set(currentPermissions);
    if (checked) {
      newPermissions.add(permission);
    } else {
      newPermissions.delete(permission);
    }
    setCustomPermissions(newPermissions);
  };

  const handleSavePermissions = () => {
    if (selectedRole === 'ALL' || assignPermissionsMutation.isPending) {
      console.log('🔑 handleSavePermissions - Skipping:', {
        selectedRole,
        isPending: assignPermissionsMutation.isPending,
      });
      return;
    }

    console.log('🔑 handleSavePermissions - Starting permission save...');

    console.log('🔑 handleSavePermissions - Debug info:', {
      selectedRole,
      rolesResponse,
      availableRoleNames: rolesResponse?.map(r => ({ name: r.name, id: r._id })),
      expectedMapping: {
        USER: 11,
        STAFF: 12,
        ADMIN: 13,
      },
    });

    const roleData = rolesResponse?.find(role => role.name === selectedRole);
    console.log('🔑 handleSavePermissions - Found roleData:', roleData);

    if (!roleData) {
      console.error(
        '🔑 handleSavePermissions - No role found for selectedRole:',
        selectedRole,
      );
      toast.error(
        'Selected role not found. Please refresh the page and try again.',
      );
      return;
    }

    // Use the actual role ID from the backend, not expected IDs
    const actualRoleId = roleData._id;
    console.log(
      '🔑 handleSavePermissions - Using actual role ID:',
      actualRoleId,
    );

    console.log('🔑 handleSavePermissions - Assigning permissions:', {
      roleId: actualRoleId,
      roleName: roleData.name,
    });

    // Call the mutation
    assignPermissionsMutation.mutate({
      id: actualRoleId,
      data: {
        permissions: Array.from(
          customPermissions ?? rolePermissions,
        ) as Permission[],
      },
    });

    console.log(
      '🔑 handleSavePermissions - Mutation called, waiting for response...',
    );
  };

  const handleSelectAll = () => {
    const allPerms = allPermissionsResponse ?? [];
    setCustomPermissions(new Set(allPerms));
  };

  const handleDeselectAll = () => {
    setCustomPermissions(new Set());
  };

  // Group permissions by category
  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: string[] } = {
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

    const permissionsToGroup = allPermissionsResponse ?? ALL_PERMISSIONS;

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
  }, [allPermissionsResponse]);

  console.log('🔑 Role Permission Page - Checking ROLE_VIEW permission:', {
    hasRoleViewPermission: hasPermission('role:view'),
    permissionValue: 'role:view',
    currentPermissions: RoleManager.getCurrentPermissions(),
    currentRole: RoleManager.getCurrentRole(),
  });

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

  // Show loading state while roles are being fetched
  if (rolesLoading) {
    return (
      <div className='space-y-8 p-6'>
        <div className='flex items-center justify-center h-96'>
          <div className='text-center'>
            <Spinner className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              Loading Roles & Permissions
            </h2>
            <p className='text-gray-600'>
              Please wait while we fetch your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if roles failed to load
  if (rolesError) {
    return (
      <div className='space-y-8 p-6'>
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
      </div>
    );
  }

  return (
    <div className='space-y-8 p-6'>
      <div className='flex items-center justify-between bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>
            Role & Permission Management
          </h1>
          <p className='text-gray-600'>
            Manage user roles and their associated permissions
          </p>
        </div>
        <div className='hidden md:flex items-center space-x-2'>
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
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefreshRoles}
            className='ml-4'
          >
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
        <div className='lg:col-span-2 space-y-6'>
          <Card className='shadow-lg border-0 bg-white'>
            <CardHeader className='bg-linear-to-r from-gray-50 to-gray-100 border-b'>
              <div className='flex items-center justify-between py-6'>
                <CardTitle className='text-xl font-semibold text-gray-900'>
                  Permissions
                </CardTitle>
                <div className='flex items-center gap-4'>
                  <Select
                    value={selectedRole}
                    onValueChange={(value: RoleOption) => {
                      setSelectedRole(value);
                      setCustomPermissions(null); // Reset custom permissions when role changes
                    }}
                  >
                    <SelectTrigger className='w-32'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='ALL'>ALL</SelectItem>
                      {rolesResponse?.map(role => {
                        console.log('🔑 Rendering role in select:', role);
                        return (
                          <SelectItem key={role._id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        );
                      })}
                      {(!rolesResponse || rolesResponse.length === 0) && (
                        <SelectItem value='loading' disabled>
                          {rolesLoading ? 'Loading roles...' : 'No roles found'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {selectedRole !== 'ALL' && (
                    <div className='flex gap-3'>
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
                        className='bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50'
                      >
                        {assignPermissionsMutation.isPending
                          ? 'Saving...'
                          : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-8'>
                {Object.entries(groupedPermissions).map(
                  ([category, permissions]) =>
                    permissions.length > 0 && (
                      <div key={category} className='space-y-4'>
                        <div className='flex items-center space-x-2'>
                          <h3 className='text-lg font-semibold text-gray-900'>
                            {category}
                          </h3>
                          <Badge variant='outline' className='text-xs'>
                            {permissions.length}
                          </Badge>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-gray-100'>
                          {permissions.map(permission => (
                            <div
                              key={permission}
                              className='flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors'
                            >
                              <Checkbox
                                id={permission}
                                checked={(
                                  customPermissions ?? rolePermissions
                                ).has(permission)}
                                onCheckedChange={checked =>
                                  handlePermissionToggle(
                                    permission,
                                    checked as boolean,
                                  )
                                }
                                disabled={
                                  selectedRole === 'ALL' ||
                                  assignPermissionsMutation.isPending
                                }
                                className='data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600'
                              />
                              <label
                                htmlFor={permission}
                                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1'
                              >
                                {permission
                                  .replace(/_/g, ' ')
                                  .toLowerCase()
                                  .replace(/\b\w/g, l => l.toUpperCase())}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Panel */}
        <div className='space-y-6'>
          <Card className='shadow-lg border-0 bg-white'>
            <CardHeader className='bg-linear-to-r from-gray-50 to-gray-100 border-b'>
              <CardTitle className='text-xl font-semibold text-gray-900'>
                Users in {selectedRole === 'ALL' ? 'All Roles' : selectedRole}{' '}
                Role
                {selectedRole !== 'ALL' && (
                  <Badge
                    variant='secondary'
                    className='ml-2 bg-blue-100 text-blue-800'
                  >
                    {filteredUsers.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRole === 'ALL' ? (
                <NoData
                  onRefresh={() => {}}
                  title='No Role Selected'
                  description='Select a specific role from the dropdown above to view users assigned to that role.'
                  icon={Users}
                  showRefresh={false}
                  compact
                />
              ) : rolesLoading ? (
                <div className='space-y-4'>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className='animate-pulse flex items-center space-x-3 p-4 border rounded-lg'
                    >
                      <div className='w-10 h-10 bg-gray-200 rounded-full' />
                      <div className='flex-1'>
                        <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
                        <div className='h-3 bg-gray-200 rounded w-1/2' />
                      </div>
                      <div className='h-6 bg-gray-200 rounded w-16' />
                    </div>
                  ))}
                </div>
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
                <div className='space-y-3'>
                  <ScrollArea className='h-96'>
                    {filteredUsers.map((user: User) => (
                      <div
                        key={user._id}
                        className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors shadow-sm'
                      >
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm'>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className='font-medium text-gray-900'>
                              {user.name}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={user.isActive ? 'default' : 'secondary'}
                          className={
                            user.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : ''
                          }
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionPage;
