'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Star, User, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import {
  useAdminTestimonials,
  useApproveTestimonial,
  useDeleteTestimonial,
} from '@/hooks/useTestimonials';
import { ScrollArea } from '@/components/ui/scroll-area';
import NoData from '@/components/no -data';

interface AdminTestimonialsManagerProps {
  showApproved?: boolean;
  showPending?: boolean;
}

export function AdminTestimonialsManager({}: AdminTestimonialsManagerProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>(
    'pending',
  );

  const {
    data: testimonials,
    isLoading,
    error,
    refetch,
  } = useAdminTestimonials({
    isApproved:
      filter === 'approved' ? true : filter === 'pending' ? false : undefined,
  });

  const approveMutation = useApproveTestimonial();
  const deleteMutation = useDeleteTestimonial();

  const handleApprove = async (id: number) => {
    await approveMutation.mutateAsync(id);
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Star className='h-5 w-5' />
            Testimonials Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='flex items-start space-x-4 p-4 border rounded-lg'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-gray-200 rounded w-3/4' />
                    <div className='h-3 bg-gray-200 rounded w-1/2' />
                    <div className='h-3 bg-gray-200 rounded w-full' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    // Check if it's a 403 Forbidden error
    const isForbidden = (error as any)?.response?.status === 403;

    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Star className='h-5 w-5' />
            Testimonials Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isForbidden ? (
            <div className='text-center py-8'>
              <div className='text-red-500 mb-2'>
                <svg
                  className='w-12 h-12 mx-auto'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Access Denied
              </h3>
              <p className='text-gray-600 mb-4'>
                You don't have administrator permissions to manage testimonials.
                Please contact a system administrator.
              </p>
            </div>
          ) : (
            <NoData
              title='Failed to Load Testimonials'
              description='Unable to load testimonials for management.'
              icon={Star}
              showRefresh
              onRefresh={() => refetch()}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Star className='h-5 w-5' />
            Testimonials Management ({testimonials?.data?.length})
          </CardTitle>
          <div className='flex gap-2'>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter('pending')}
            >
              Pending (
              {testimonials?.data?.filter(t => !t.isApproved).length || 0})
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter('approved')}
            >
              Approved (
              {testimonials?.data?.filter(t => t.isApproved).length || 0})
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!testimonials || testimonials.data.length === 0 ? (
          <NoData
            title='No Testimonials Found'
            description={`No ${filter === 'pending' ? 'pending' : filter === 'approved' ? 'approved' : ''} testimonials to manage.`}
            icon={Star}
            showRefresh
            onRefresh={() => refetch()}
          />
        ) : (
          <ScrollArea className='h-96'>
            <div className='space-y-4'>
              {testimonials.data.map(testimonial => (
                <div
                  key={testimonial._id}
                  className='flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <Avatar className='w-10 h-10'>
                    <AvatarImage
                      src={testimonial.user.profileUrl}
                      alt={testimonial.user.name}
                    />
                    <AvatarFallback>
                      <User className='w-4 h-4' />
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1 space-y-2'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-2'>
                        <h4 className='font-semibold text-gray-900'>
                          {testimonial.user.name}
                        </h4>
                        <div className='flex items-center'>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= testimonial.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge
                          variant={
                            testimonial.isApproved ? 'default' : 'secondary'
                          }
                          className={
                            testimonial.isApproved
                              ? 'bg-green-100 text-green-800'
                              : ''
                          }
                        >
                          {testimonial.isApproved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div className='text-sm text-gray-500'>
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <h5 className='font-medium text-gray-800'>
                      {testimonial.title}
                    </h5>

                    <p className='text-gray-600 leading-relaxed'>
                      {testimonial.content}
                    </p>

                    {!testimonial.isApproved && (
                      <div className='flex gap-2 pt-2'>
                        <Button
                          size='sm'
                          onClick={() => handleApprove(testimonial._id)}
                          disabled={approveMutation.isPending}
                          className='bg-green-600 hover:bg-green-700'
                        >
                          <CheckCircle className='w-4 h-4 mr-1' />
                          Approve
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size='sm'
                              variant='destructive'
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className='w-4 h-4 mr-1' />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Testimonial
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this
                                testimonial? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(testimonial._id)}
                                className='bg-red-600 hover:bg-red-700'
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
