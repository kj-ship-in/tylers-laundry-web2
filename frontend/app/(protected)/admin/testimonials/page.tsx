'use client';

import React, { useState } from 'react';
import DataTable from '@/components/table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  Trash2,
  Star,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useAdminTestimonials,
  useApproveTestimonial,
  useDeleteTestimonial,
} from '@/hooks/useTestimonials';
import type { Testimonial } from '@/types/testimonials';
import { TestimonialDetailsSheet } from '@/components/sheets/TestimonialDetailsSheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TestimonialsStats } from '@/components/testimonials/TestimonialsStats';
import Image from 'next/image';
import { appImages } from '@/constants/app-images';

const AdminTestimonialsPage = () => {
  // Permission checks
  const { hasPermission } = usePermissions();

  // Filter state
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    data,
    isFetching: isLoading,
    error,
    refetch,
  } = useAdminTestimonials({
    isApproved:
      filter === 'approved' ? true : filter === 'pending' ? false : undefined,
  });

  const testimonials = data?.data ?? [];

  const approveMutation = useApproveTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const handleApprove = async (testimonialId: string) => {
    try {
      await approveMutation.mutateAsync(testimonialId);
    } catch (error) {
      toast.error('Failed to approve testimonial');
    }
  };

  const handleDelete = async (testimonialId: string) => {
    try {
      await deleteMutation.mutateAsync(testimonialId);
      toast.success('Testimonial deleted successfully');
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const columns: Array<{
    key?: keyof Testimonial;
    title: string;
    width?: string;
    render?: (value: any, row?: Testimonial, index?: number) => React.ReactNode;
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
      title: 'Customer',
      render: (_: any, row?: Testimonial) => {
        if (!row) return null;
        return (
          <div className='flex items-center space-x-3'>
            <div className='w-8 h-8'>
              <Image
                src={
                  row.user.profileUrl
                    ? `/api/images${row.user.profileUrl}`
                    : appImages.profileImage
                }
                alt={row.user.name}
                width={32}
                height={32}
                className='rounded-full w-8 h-8  object-cover'
              />
            </div>
            <div>
              <div className='font-medium text-gray-900'>{row.user.name}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'rating',
      title: 'Rating',
      render: (value: number) => (
        <div className='flex items-center'>
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className='ml-2 text-sm text-gray-600'>({value})</span>
        </div>
      ),
    },
    {
      key: 'title',
      title: 'Title',
    },
    {
      key: 'content',
      title: 'Content',
      render: (value: string) => (
        <div className='max-w-xs truncate' title={value}>
          {value}
        </div>
      ),
    },
    {
      key: 'isApproved',
      title: 'Status',
      render: (value: boolean) => (
        <Badge
          className={
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }
        >
          {value ? 'Approved' : 'Pending'}
        </Badge>
      ),
    },
    {
      key: 'isActive',
      title: 'Active',
      render: (value: boolean, row?: Testimonial) => (
        <Button
          variant={value ? 'default' : 'outline'}
          size='sm'
          onClick={() => {
            if (!value && row) {
              handleApprove(row._id);
            }
          }}
          disabled={approveMutation.isPending}
          className={value ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {value ? 'Active' : 'Activate'}
        </Button>
      ),
    },
    {
      key: 'createdAt',
      title: 'Created At',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      title: 'Actions',
      width: '120px',
      render: (_: any, row?: Testimonial) => {
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
                <button
                  className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                  onClick={() => {
                    setSelectedTestimonial(row);
                    setIsSheetOpen(true);
                  }}
                >
                  <Eye className='mr-2 h-4 w-4' />
                  View Details
                </button>
                {hasPermission('testimonial:manage') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm hover:bg-gray-100'
                    onClick={() => handleApprove(row._id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className='mr-2 h-4 w-4' />
                    {row.isApproved ? 'Approved' : 'Approve'}
                  </button>
                )}
                {hasPermission('testimonial:manage') && (
                  <button
                    className='flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50'
                    onClick={() => handleDelete(row._id)}
                    disabled={deleteMutation.isPending}
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
            Error loading testimonials: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='mb-8'>
        <TestimonialsStats />
      </div>

      {/* Filter Buttons */}
      <div className='flex gap-2'>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setFilter('all')}
        >
          All ({testimonials.filter(t => t).length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setFilter('pending')}
        >
          Pending ({testimonials.filter(t => !t.isApproved).length})
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          size='sm'
          onClick={() => setFilter('approved')}
        >
          Approved ({testimonials.filter(t => t.isApproved).length})
        </Button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={testimonials}
        loading={isLoading}
        enableSorting
        enableFiltering
        enablePagination
        searchPlaceholder='Search testimonials...'
        emptyMessage='No testimonials found.'
        onRowClick={row => {
          // TODO: Implement row click to view details
          console.log('Row clicked:', row);
        }}
      />

      {/* Testimonial Details Sheet */}
      <TestimonialDetailsSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        testimonial={selectedTestimonial}
        onApprove={handleApprove}
        onDelete={handleDelete}
        isApproving={approveMutation.isPending}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminTestimonialsPage;
