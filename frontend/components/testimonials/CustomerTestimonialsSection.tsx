'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
                Access Restricted
              </h3>
              <p className='text-gray-600 mb-4'>
                You don't have permission to view or manage testimonials. Please
                contact an administrator if you believe this is an error.
              </p>
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
