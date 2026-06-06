'use client';

import React, { useState } from 'react';
import DataTable from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { useStaffs } from '@/hooks/useUserQuery';
import {
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useToggleStaffStatusMutation,
} from '@/hooks/useAdminQuries';
import type { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { AddStaffDialog } from '@/components/dialog/AddStaffDialog';
import { StaffDetailsSheet } from '@/components/sheets/StaffDetailsSheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  MoreHorizontal,
  Eye,
  Edit,
  UserX,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/permission';

const CustomersPage = () => {
  // Permission checks
  const { hasPermission } = usePermissions();

  // Pagination and search state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data, isLoading, error, refetch } = useStaffs(page, pageSize, search);
  const staffs = data?.data ?? [];
  const pagination = data?.pagination;

  const updateStaffMutation = useUpdateStaffMutation({
    onSuccess: () => {
      toast.success('Staff updated successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to update staff');
    },
  });

  const deleteStaffMutation = useDeleteStaffMutation({
    onSuccess: () => {
      toast.success('Staff deleted successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to delete staff');
    },
  });

  const toggleStatusMutation = useToggleStaffStatusMutation({
    onSuccess: () => {
      toast.success('Staff status updated successfully');
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message ?? 'Failed to update staff status');
    },
  });

  const columns: Array<{
    key?: keyof User;
    title: string;
    width?: string;
    render?: (value: any, row?: User, index?: number) => React.ReactNode;
  }> = [
    {
      title: '#No',
      width: '60px',
      render: (_: any, __: any, index?: number) => {
        const rowIndex = (index ?? 0) + 1 + (page - 1) * pageSize;
        const formattedIndex = rowIndex.toString().padStart(2, '0');
        return (
          <div className='text-start text-slate-600'>{formattedIndex}</div>
        );
      },
    },
    {
      key: 'name',
      title: 'Name',
    },
    {
      key: 'email',
      title: 'Email',
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value: string) =>
        value || <span className='text-gray-400'>N/A</span>,
    },
    {
      key: 'address',
      title: 'Address',
      render: (value: string) =>
        value || <span className='text-gray-400'>N/A</span>,
    },
    {
      key: 'isVerified',
      title: 'Verified',
      render: (value: boolean) => (
        <Badge
          className={
            value
              ? 'bg-green-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }
        >
          {value ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      title: 'Active',
      render: (value: boolean) => (
        <Badge
          className={
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }
        >
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (value: string) => new Date(value).toDateString(),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Actions',
      width: '100px',
      render: (_: any, row?: User) => {
        if (!row) return null;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-48 p-0' align='end'>
              <div className='py-1'>
                {hasPermission('staff:view') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                    onClick={() => {
                      setSelectedStaff(row);
                      setIsSheetOpen(true);
                    }}
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    View Details
                  </button>
                )}
                {hasPermission('staff:update') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                    onClick={() => {
                      // TODO: Implement edit functionality
                      toast.info('Edit functionality coming soon');
                    }}
                  >
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                  </button>
                )}
                {hasPermission('staff:manage') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                    onClick={() => {
                      toggleStatusMutation.mutate({
                        staffId: row._id,
                        isActive: !row.isActive,
                      });
                    }}
                  >
                    {row.isActive ? (
                      <>
                        <UserX className='mr-2 h-4 w-4' />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className='mr-2 h-4 w-4' />
                        Activate
                      </>
                    )}
                  </button>
                )}
                {hasPermission('staff:delete') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-gray-100'
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to delete this staff member?',
                        )
                      ) {
                        deleteStaffMutation.mutate(row._id);
                      }
                    }}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-800'>
            Error loading customers: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Staffs</h1>
          <p className='text-gray-600'>View and manage your staffs</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={staffs}
        loading={isLoading}
        searchPlaceholder='Search staffs...'
        emptyMessage='No staffs found.'
        enableSorting
        enableFiltering
        enablePagination
        pageSize={pagination?.limit ?? 10}
        showButton
        onClick={() => setIsModalOpen(true)}
        buttonTitle='Add New Staff'
        // Note: DataTable manages search and pagination internally. To sync with server, see comment below.
      />
      <AddStaffDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <StaffDetailsSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        staff={selectedStaff}
        onEdit={_staff => {
          // TODO: Implement edit functionality
          toast.info('Edit functionality coming soon');
        }}
        onDelete={staffId => {
          if (confirm('Are you sure you want to delete this staff member?')) {
            deleteStaffMutation.mutate(String(staffId));
          }
        }}
        onToggleStatus={(staffId, isActive) => {
          toggleStatusMutation.mutate({ staffId: String(staffId), isActive });
        }}
      />
    </div>
  );
};

export default CustomersPage;
