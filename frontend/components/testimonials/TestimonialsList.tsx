'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, User } from 'lucide-react';
import { useAdminTestimonials, useTestimonials } from '@/hooks/useTestimonials';
import { ScrollArea } from '@/components/ui/scroll-area';
import NoData from '@/components/no -data';

interface TestimonialsListProps {
  limit?: number;
  showTitle?: boolean;
}

export function TestimonialsList({
  limit,
  showTitle = true,
}: TestimonialsListProps) {
  const {
    data: testimonials,
    isLoading,
    error,
  } = useAdminTestimonials({
    limit,
    isApproved: true, // Only show approved testimonials
  });

  if (isLoading) {
    return (
      <Card className='w-full'>
        {showTitle && (
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Star className='h-5 w-5' />
              Customer Reviews
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className='space-y-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='flex items-start space-x-4'>
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
        {showTitle && (
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Star className='h-5 w-5' />
              Customer Reviews
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          {isForbidden ? (
            <div className='text-center py-8'>
              <div className='text-orange-500 mb-2'>
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
                Reviews Unavailable
              </h3>
              <p className='text-gray-600 mb-4'>
                Customer reviews are currently not accessible. Please try again
                later.
              </p>
            </div>
          ) : (
            <NoData
              title='Failed to Load Reviews'
              description='Unable to load customer reviews at this time.'
              icon={Star}
              showRefresh
              onRefresh={() => window.location.reload()}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  if (!testimonials || testimonials?.data?.length === 0) {
    return (
      <Card className='w-full'>
        {showTitle && (
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Star className='h-5 w-5' />
              Customer Reviews
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <NoData
            title='No Reviews Yet'
            description="Be the first to share your experience with Tyler's Laundry!"
            icon={Star}
            showRefresh={false}
            onRefresh={() => {}}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      {showTitle && (
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Star className='h-5 w-5' />
            Customer Reviews ({testimonials?.data?.length || 0})
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ScrollArea className='h-96'>
          <div className='space-y-6'>
            {testimonials?.data?.map(testimonial => (
              <div
                key={testimonial._id}
                className='border-b border-gray-100 pb-6 last:border-b-0 last:pb-0'
              >
                <div className='flex items-start space-x-4'>
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
                      </div>
                      <Badge variant='outline' className='text-xs'>
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>

                    <h5 className='font-medium text-gray-800'>
                      {testimonial.title}
                    </h5>

                    <p className='text-gray-600 leading-relaxed'>
                      {testimonial.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
