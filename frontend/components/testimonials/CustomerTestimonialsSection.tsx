'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Edit, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingDialog } from '@/components/dialog/RatingDialog';
import { useMyTestimonials } from '@/hooks/useTestimonials';
import NoData from '@/components/no -data';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface CustomerTestimonialsSectionProps {
  showHeader?: boolean;
  compact?: boolean;
}

export function CustomerTestimonialsSection({
  showHeader = true,
  compact = false,
}: CustomerTestimonialsSectionProps) {
  const { status } = useSession();
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') {
      redirect('/login');
    }
  }, [status]);

  // Check if user already has testimonials
  const {
    data: myTestimonials,
    error: testimonialsError,
    isError: hasTestimonialsError,
    refetch: refetchMyTestimonials,
  } = useMyTestimonials(status === 'authenticated');
  const existingTestimonial = myTestimonials ?? null;
  const hasExistingTestimonial = !!existingTestimonial;

  // Check if it's a 403 Forbidden error
  const isForbidden =
    hasTestimonialsError &&
    (testimonialsError as any)?.response?.status === 403;

  return (
    <div className={compact ? 'space-y-4' : 'space-y-8'}>
      {/* Header */}
      {showHeader && (
        <div className='flex items-center justify-between bg-linear-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Testimonials & Reviews
            </h2>
            <p className='text-gray-600'>
              Share your experience and view customer reviews
            </p>
          </div>
          <div className='hidden md:flex items-center space-x-2'>
            <Button
              onClick={() => setShowRatingDialog(true)}
              className='bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              disabled={isForbidden}
            >
              {hasExistingTestimonial ? (
                <>
                  <Edit className='mr-2' size={18} />
                  Edit Your Review
                </>
              ) : (
                <>
                  <MessageSquare className='mr-2' size={18} />
                  Write a Review
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* My Testimonials */}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>My Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          {isForbidden ? (
            <div className='text-center py-8 text-gray-500'>
              <MessageSquare className='w-12 h-12 mx-auto mb-3 text-gray-300' />
              <h3 className='text-lg font-semibold text-gray-900 mb-1'>
                Access Restricted
              </h3>
              <p className='text-sm'>
                You don't have permission to view or manage testimonials.
              </p>
            </div>
          ) : hasExistingTestimonial && existingTestimonial ? (
            <div className='space-y-4'>
              <div className='flex items-start justify-between gap-4'>
                <div className='space-y-2 flex-1'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <div className='flex'>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= existingTestimonial.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <Badge
                      className={
                        existingTestimonial.isApproved
                          ? 'bg-green-100 text-green-700 hover:bg-green-100'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                      }
                    >
                      {existingTestimonial.isApproved
                        ? 'Approved'
                        : 'Pending approval'}
                    </Badge>
                  </div>
                  <p className='font-semibold text-gray-900'>
                    {existingTestimonial.title}
                  </p>
                  <p className='text-gray-600 leading-relaxed'>
                    {existingTestimonial.content}
                  </p>
                  <p className='text-xs text-gray-400'>
                    Submitted{' '}
                    {new Date(existingTestimonial.createdAt).toLocaleDateString(
                      'en-US',
                      { month: 'long', day: 'numeric', year: 'numeric' },
                    )}
                  </p>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setShowRatingDialog(true)}
                  className='shrink-0'
                >
                  <Edit className='w-3.5 h-3.5 mr-1.5' />
                  Edit
                </Button>
              </div>
            </div>
          ) : (
            <NoData
              title='No Testimonials Yet'
              description="You haven't submitted any testimonials yet. Share your experience with Tyler's Laundry!"
              icon={MessageSquare}
              showRefresh={false}
              onRefresh={refetchMyTestimonials}
            />
          )}
        </CardContent>
      </Card>

      {/* Rating Dialog */}
      <RatingDialog
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        existingTestimonial={existingTestimonial}
      />
    </div>
  );
}
