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
import { Permission } from '@/types/permission';

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
    render?: (value: any, row?: Service, index?: number) => React.ReactNode;
  }> = [
    {
      title: '#No',
      width: '60px',
      render: (_: any, __: any, index?: number) => {
        const rowIndex = (index ?? 0) + 1;
        const formattedIndex = rowIndex.toString().padStart(2, '0');
        return (
          <div className='text-start text-slate-600'>{formattedIndex}</div>
        );
      },
    },
    {
      title: 'Service',
      render: (_: any, row?: Service) => {
        if (!row) return 'N/A';
        return (
          <div className='space-y-1'>
            <div className='font-medium text-gray-900'>{row.title}</div>
            {row.description && (
              <div className='text-sm text-gray-600 line-clamp-2'>
                {row.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'turnaround',
      title: 'Turnaround',
    },
    {
      title: 'Features',
      render: (_: any, row?: Service) => {
        if (!row?.features || row.features.length === 0) return 'N/A';
        return (
          <div className='flex flex-wrap gap-1 max-w-[200px]'>
            {row.features.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant='outline' className='text-xs'>
                {feature}
              </Badge>
            ))}
            {row.features.length > 2 && (
              <Badge variant='outline' className='text-xs'>
                +{row.features.length - 2} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      title: 'Includes',
      render: (_: any, row?: Service) => {
        if (!row?.includes || row.includes.length === 0) return 'N/A';
        return (
          <div className='flex flex-wrap gap-1 max-w-[200px]'>
            {row.includes.slice(0, 2).map((include, index) => (
              <Badge key={index} variant='outline' className='text-xs'>
                {include}
              </Badge>
            ))}
            {row.includes.length > 2 && (
              <Badge variant='outline' className='text-xs'>
                +{row.includes.length - 2} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      title: 'Ideal For',
      render: (_: any, row?: Service) => {
        if (!row?.ideal) return 'N/A';

        // Handle case where ideal might be a string (from API) or array
        let idealItems: string[];
        if (Array.isArray(row.ideal)) {
          idealItems = row.ideal;
        } else if (typeof (row.ideal as any) === 'string' && row.ideal.trim()) {
          // Split comma-separated string and trim each item
          idealItems = row.ideal
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        } else {
          idealItems = [];
        }

        if (idealItems.length === 0) return 'N/A';

        return (
          <div className='flex flex-wrap gap-1 max-w-[200px]'>
            {idealItems.slice(0, 2).map((item, index) => (
              <Badge key={index} variant='outline' className='text-xs'>
                {item}
              </Badge>
            ))}
            {idealItems.length > 2 && (
              <Badge variant='outline' className='text-xs'>
                +{idealItems.length - 2} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Actions',
      render: (_: any, row?: Service) => {
        if (!row) return null;
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreVertical className='w-4 h-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-40 p-0' align='end'>
              <div className='flex flex-col'>
                {hasPermission('service:view') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='justify-start'
                    onClick={() => handleViewService(row._id)}
                  >
                    <Eye className='w-4 h-4 mr-2' />
                    View
                  </Button>
                )}
                {hasPermission('service:update') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='justify-start'
                    onClick={() => handleEditService(row)}
                  >
                    <Edit className='w-4 h-4 mr-2' />
                    Edit
                  </Button>
                )}
                {hasPermission('service:delete') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='justify-start text-red-600 hover:text-red-700 hover:bg-red-50'
                    onClick={() => handleDeleteService(row)}
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
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
