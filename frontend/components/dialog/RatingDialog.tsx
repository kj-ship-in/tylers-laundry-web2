'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LogIn, Star, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  useCreateTestimonial,
  useUpdateTestimonial,
} from '@/hooks/useTestimonials';
import type { Testimonial } from '@/types/testimonials';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingTestimonial?: Testimonial | null;
}

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RatingDialog({
  open,
  onOpenChange,
  existingTestimonial,
}: RatingDialogProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');

  const createTestimonialMutation = useCreateTestimonial();
  const updateTestimonialMutation = useUpdateTestimonial();

  // Check if user is authenticated
  const isAuthenticated = status === 'authenticated';
  const isEditing = !!existingTestimonial;

  // Initialize form with existing testimonial data when editing
  React.useEffect(() => {
    if (existingTestimonial && open) {
      setRating(existingTestimonial.rating);
      setTitle(existingTestimonial.title);
      setReview(existingTestimonial.content);
    } else if (!existingTestimonial && open) {
      // Reset form when creating new testimonial
      setRating(0);
      setTitle('');
      setReview('');
    }
  }, [existingTestimonial, open]);

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleStarHover = (value: number) => {
    setHoveredRating(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      onOpenChange(false);
      router.push('/login');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!title.trim() || !review.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const testimonialData = {
      rating,
      title: title.trim(),
      content: review.trim(),
    };

    if (isEditing && existingTestimonial) {
      // Update existing testimonial
      updateTestimonialMutation.mutate(
        {
          id: existingTestimonial._id,
          data: testimonialData,
        },
        {
          onSuccess: () => {
            // Reset form and close dialog
            setRating(0);
            setTitle('');
            setReview('');
            onOpenChange(false);
          },
        },
      );
    } else {
      // Create new testimonial
      createTestimonialMutation.mutate(testimonialData, {
        onSuccess: () => {
          // Reset form and close dialog
          setRating(0);
          setTitle('');
          setReview('');
          onOpenChange(false);
        },
      });
    }
  };

  const handleLoginRedirect = () => {
    onOpenChange(false);
    router.push('/login');
  };

  const handleSignUpRedirect = () => {
    onOpenChange(false);
    router.push('/signup');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>
            {isAuthenticated
              ? isEditing
                ? 'Edit Your Review'
                : 'Write a Review'
              : 'Login Required'}
          </DialogTitle>
          <DialogDescription>
            {isAuthenticated
              ? isEditing
                ? "Update your experience with Tyler's Laundry. Your review will be published after approval."
                : "Share your experience with Tyler's Laundry. Your review will be published after approval."
              : 'Please log in or create an account to write a review.'}
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className='py-6 space-y-4'>
            <p className='text-center text-gray-600'>
              You need to be logged in to submit a review.
            </p>
            <div className='flex gap-3 justify-center'>
              <Button
                onClick={handleLoginRedirect}
                className='flex-1 bg-blue-600 hover:bg-blue-700'
              >
                <LogIn className='mr-2' size={18} />
                Log In
              </Button>
              <Button
                variant='outline'
                onClick={handleSignUpRedirect}
                className='flex-1'
              >
                <UserPlus className='mr-2' size={18} />
                Sign Up
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-6 py-4'>
            {/* Star Rating */}
            <div className='space-y-2'>
              <Label>Your Rating *</Label>
              <div className='flex gap-2'>
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    type='button'
                    onClick={() => handleStarClick(value)}
                    onMouseEnter={() => handleStarHover(value)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className='transition-transform hover:scale-110'
                    aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={32}
                      className={`${
                        value <= (hoveredRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className='text-sm text-gray-600'>
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Review Title */}
            <div className='space-y-2'>
              <Label htmlFor='title'>Review Title *</Label>
              <Input
                id='title'
                placeholder='Sum up your experience in a few words'
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
                required
              />
              <p className='text-xs text-gray-500'>
                {title.length}/100 characters
              </p>
            </div>

            {/* Review Content */}
            <div className='space-y-2'>
              <Label htmlFor='review'>Your Review *</Label>
              <Textarea
                id='review'
                placeholder='Tell us about your experience with our service...'
                value={review}
                onChange={e => setReview(e.target.value)}
                rows={5}
                maxLength={500}
                required
              />
              <p className='text-xs text-gray-500'>
                {review.length}/500 characters
              </p>
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={
                  createTestimonialMutation.isPending ||
                  updateTestimonialMutation.isPending
                }
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={
                  createTestimonialMutation.isPending ||
                  updateTestimonialMutation.isPending
                }
              >
                {createTestimonialMutation.isPending ||
                updateTestimonialMutation.isPending
                  ? 'Submitting...'
                  : isEditing
                    ? 'Update Review'
                    : 'Submit Review'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
