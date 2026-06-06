'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Testimonial } from '@/types/testimonials';
import { appImages } from '@/constants/app-images';
import { Star, User, Calendar, CheckCircle, ThumbsUp } from 'lucide-react';

interface TestimonialDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  testimonial: Testimonial | null;
  onApprove?: (testimonialId: string) => void;
  onDelete?: (testimonialId: string) => void;
  isApproving?: boolean;
  isDeleting?: boolean;
}

export const TestimonialDetailsSheet: React.FC<
  TestimonialDetailsSheetProps
> = ({
  isOpen,
  onClose,
  testimonial,
  onApprove,
  onDelete,
  isApproving = false,
  isDeleting = false,
}) => {
  if (!testimonial) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-2xl'>
        <SheetHeader>
          <SheetTitle>Testimonial Details</SheetTitle>
          <SheetDescription>
            View and manage testimonial information
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6'>
          {/* Customer Profile Section */}
          <div className='flex items-center space-x-4'>
            <Avatar className='h-16 w-16'>
              <AvatarImage
                src={
                  testimonial.user?.profileUrl
                    ? `/api/images${testimonial.user.profileUrl}`
                    : appImages.profileImage.src
                }
                alt={testimonial.user?.name ?? 'User'}
              />
              <AvatarFallback>
                <User className='w-6 h-6' />
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <h3 className='text-lg font-semibold text-gray-900'>
                {testimonial.user.name}
              </h3>
              <p className='text-sm text-gray-500'>Customer</p>
              <div className='flex items-center space-x-2 mt-2'>
                <Badge
                  className={
                    testimonial.isApproved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {testimonial.isApproved ? 'Approved' : 'Pending'}
                </Badge>
                <Badge
                  className={
                    testimonial.isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {testimonial.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Rating Section */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-gray-900 flex items-center'>
              <Star className='h-4 w-4 mr-2' />
              Rating & Review
            </h4>

            <div className='bg-gray-50 rounded-lg p-4 space-y-4'>
              {/* Rating Stars */}
              <div className='flex items-center space-x-2'>
                <div className='flex items-center'>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className='text-sm font-medium text-gray-700'>
                  {testimonial.rating} out of 5 stars
                </span>
              </div>

              {/* Title */}
              <div>
                <h5 className='font-medium text-gray-900 text-lg'>
                  {testimonial.title}
                </h5>
              </div>

              {/* Content */}
              <div className='bg-white rounded-md p-3 border'>
                <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                  {testimonial.content}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className='space-y-4'>
            <h4 className='text-sm font-medium text-gray-900 flex items-center'>
              <Calendar className='h-4 w-4 mr-2' />
              Timeline
            </h4>

            <div className='grid grid-cols-2 gap-4'>
              <div className='bg-gray-50 rounded-lg p-3'>
                <p className='text-xs text-gray-500 uppercase tracking-wide'>
                  Created
                </p>
                <p className='text-sm font-medium text-gray-900'>
                  {format(new Date(testimonial.createdAt), 'PPP')}
                </p>
                <p className='text-xs text-gray-500'>
                  {format(new Date(testimonial.createdAt), 'p')}
                </p>
              </div>

              <div className='bg-gray-50 rounded-lg p-3'>
                <p className='text-xs text-gray-500 uppercase tracking-wide'>
                  Last Updated
                </p>
                <p className='text-sm font-medium text-gray-900'>
                  {format(new Date(testimonial.updatedAt), 'PPP')}
                </p>
                <p className='text-xs text-gray-500'>
                  {format(new Date(testimonial.updatedAt), 'p')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <Separator />
          <div className='flex gap-3'>
            <Button
              onClick={() => onApprove?.(testimonial._id)}
              disabled={isApproving}
              className='flex-1 bg-green-600 hover:bg-green-700'
            >
              <CheckCircle className='w-4 h-4 mr-2' />
              {isApproving
                ? 'Approving...'
                : testimonial.isApproved
                  ? 'Already Approved'
                  : 'Approve Testimonial'}
            </Button>

            <Button
              variant='destructive'
              onClick={() => onDelete?.(testimonial._id)}
              disabled={isDeleting}
              className='flex-1'
            >
              <ThumbsUp className='w-4 h-4 mr-2' />
              {isDeleting ? 'Deleting...' : 'Delete Testimonial'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
