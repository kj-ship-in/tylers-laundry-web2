'use client';

import React, { useState } from 'react';
import DataTable from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import {
  useFetchServices,
  useFetchServicesById,
  useDeleteService,
} from '@/hooks/useServicesQuery';
import type { Service } from '@/types/service';
import { Button } from '@/components/ui/button';
import { Eye, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import ServiceDetailsSheet from '@/components/sheets/ServiceDetailsSheet';
import AddServiceDialog from '@/components/dialog/AddServiceDialog';
import DeleteServiceDialog from '@/components/dialog/DeleteServiceDialog';
import { usePermissions } from '@/hooks/usePermissions';

const ServicesPage = () => {
  const { data, isLoading, error } = useFetchServices();
  const services = data ?? [];
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Permission checks
  const { hasPermission } = usePermissions();

  const { data: serviceDetails, isLoading: loadingDetails } =
    useFetchServicesById(selectedServiceId ?? '');

  const deleteServiceMutation = useDeleteService(
    () => {
      // Success callback
      setSuccessMessage('Service deleted successfully!');
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    (error: any) => {
      // Error callback
      console.error('Delete service error:', error);
      alert(
        error?.response?.data?.message ??
          error.message ??
          'Failed to delete service. Please try again.',
      );
    },
  );

  const handleViewService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setDrawerOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingService(null);
    }
  };

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteService = () => {
    if (!serviceToDelete) {
      console.error('❌ No service to delete');
      return;
    }

    console.log('🗑️ Confirming delete for service:', serviceToDelete);
    console.log(
      '🆔 Service ID:',
      serviceToDelete._id,
      'Type:',
      typeof serviceToDelete._id,
    );

    deleteServiceMutation.mutate(serviceToDelete._id);
  };

  const handleAddService = () => {
    setAddDialogOpen(true);
  };

  const handleServiceSuccess = (message: string) => {
    setSuccessMessage(message);
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const columns: Array<{
    key?: keyof Service;
    title: string;
    width?: string;
    className?: string;
    render?: (value: any, row?: Service, index?: number) => React.ReactNode;
  }> = [
    {
      title: '#',
      width: '48px',
      render: (_: any, __: any, index?: number) => (
        <span className='text-slate-400 text-sm font-mono'>
          {String((index ?? 0) + 1).padStart(2, '0')}
        </span>
      ),
    },
    {
      title: 'Service',
      render: (_: any, row?: Service) => {
        if (!row) return 'N/A';
        return (
          <div className='space-y-1 min-w-[140px]'>
            <div className='font-medium text-gray-900 leading-tight'>
              {row.title}
            </div>
            <div className='flex items-center gap-2 flex-wrap'>
              {row.type && (
                <Badge variant='secondary' className='text-xs capitalize'>
                  {row.type}
                </Badge>
              )}
              {row.isActive ? (
                <Badge className='text-xs bg-green-100 text-green-700 hover:bg-green-100'>
                  Active
                </Badge>
              ) : (
                <Badge variant='outline' className='text-xs text-gray-400'>
                  Inactive
                </Badge>
              )}
            </div>
            {row.description && (
              <div className='text-xs text-gray-500 line-clamp-1 max-w-xs'>
                {row.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Price',
      key: 'price',
      width: '90px',
      render: (value: number) => (
        <span className='font-semibold text-gray-900'>
          ${Number(value ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Turnaround',
      key: 'turnaround',
      className: 'hidden sm:table-cell',
      width: '120px',
      render: (value: string) => (
        <span className='text-sm text-gray-600 whitespace-nowrap'>
          {value || '—'}
        </span>
      ),
    },
    {
      title: 'Features',
      className: 'hidden md:table-cell',
      render: (_: any, row?: Service) => {
        if (!row) return null;
        const featureCount = row.features?.length ?? 0;
        const includeCount = row.includes?.length ?? 0;

        const idealItems: string[] = Array.isArray(row.ideal)
          ? row.ideal
          : typeof row.ideal === 'string' && row.ideal.trim()
            ? row.ideal
                .split(',')
                .map(s => s.trim())
                .filter(Boolean)
            : [];

        return (
          <div className='flex flex-col gap-1 text-xs text-gray-600 min-w-[130px]'>
            {featureCount > 0 && (
              <span>
                <span className='font-medium text-gray-700'>
                  {featureCount}
                </span>{' '}
                feature{featureCount !== 1 ? 's' : ''}
              </span>
            )}
            {includeCount > 0 && (
              <span>
                <span className='font-medium text-gray-700'>
                  {includeCount}
                </span>{' '}
                included
              </span>
            )}
            {idealItems.length > 0 && (
              <span className='text-gray-500 line-clamp-1'>
                For: {idealItems.slice(0, 2).join(', ')}
                {idealItems.length > 2 ? '…' : ''}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Created',
      className: 'hidden lg:table-cell',
      width: '100px',
      render: (value: string) => (
        <span className='text-sm text-gray-500 whitespace-nowrap'>
          {new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      title: 'Actions',
      width: '60px',
      render: (_: any, row?: Service) => {
        if (!row) return null;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                <MoreVertical className='w-4 h-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-40 p-1' align='end'>
              <div className='flex flex-col gap-0.5'>
                {hasPermission('service:view') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='justify-start h-8 text-sm'
                    onClick={() => handleViewService(row._id)}
                  >
                    <Eye className='w-3.5 h-3.5 mr-2' />
                    View
                  </Button>
                )}
                {hasPermission('service:update') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='justify-start h-8 text-sm'
                    onClick={() => handleEditService(row)}
                  >
                    <Edit className='w-3.5 h-3.5 mr-2' />
                    Edit
                  </Button>
                )}
                {hasPermission('service:delete') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50'
                    onClick={() => handleDeleteService(row)}
                  >
                    <Trash2 className='w-3.5 h-3.5 mr-2' />
                    Delete
                  </Button>
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
            Error loading services: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      {successMessage && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <p className='text-green-800'>{successMessage}</p>
        </div>
      )}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Services</h1>
          <p className='text-gray-600'>View and manage your services</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={services}
        loading={isLoading}
        searchPlaceholder='Search services...'
        emptyMessage='No services found.'
        enableSorting
        enableFiltering
        enablePagination
        pageSize={10}
        showButton
        onClick={handleAddService}
        buttonTitle='Add New Service'
      />

      <ServiceDetailsSheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        service={serviceDetails}
        isLoading={loadingDetails}
      />

      <AddServiceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleServiceSuccess}
      />

      <AddServiceDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        service={editingService}
        onSuccess={handleServiceSuccess}
      />

      <DeleteServiceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        service={serviceToDelete}
        onConfirm={confirmDeleteService}
        isDeleting={deleteServiceMutation.isPending}
      />
    </div>
  );
};

export default ServicesPage;
