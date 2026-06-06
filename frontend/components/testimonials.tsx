import { useTestimonials } from '@/hooks/useTestimonials';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { appImages } from '@/constants/app-images';
import { Skeleton } from './ui/skeleton';

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const {
    data: testimonialsData,
    isLoading,
    error,
  } = useTestimonials({
    isApproved: true,
    limit: 10, // Limit to prevent too many testimonials in carousel
  });

  const testimonials = testimonialsData ?? [];

  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
      }, 5000);

      return () => clearInterval(interval);
    }
    return () => {}; // Return empty cleanup function when no interval is set
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial(
      prev => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className='max-w-7xl mx-auto'>
        <div className='relative'>
          <div className='bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-gray-100'>
            <div className='flex flex-col md:flex-row gap-8 items-center'>
              <Skeleton className='w-32 h-32 rounded-full' />
              <div className='flex-1 space-y-4'>
                <Skeleton className='h-6 w-32' />
                <Skeleton className='h-20 w-full' />
                <div className='space-y-2'>
                  <Skeleton className='h-6 w-40' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-gray-100'>
          <div className='text-center text-gray-500'>
            <p>Unable to load testimonials at this time.</p>
            <p>Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!testimonials || testimonials.length === 0) {
    return (
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-gray-100'>
          <div className='text-center text-gray-500'>
            <Star className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <p className='text-lg font-medium'>No testimonials yet</p>
            <p>Be the first to share your experience!</p>
          </div>
        </div>
      </div>
    );
  }

  const userProfile = testimonials[currentTestimonial]?.user?.profileUrl
    ? `/api/images${testimonials[currentTestimonial]?.user?.profileUrl}`
    : appImages.profileImage;

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='relative'>
        <div className='bg-white rounded-2xl p-8 md:p-12 shadow-xl border-2 border-gray-100'>
          <div className='flex flex-col md:flex-row gap-8 items-center'>
            <div className='w-32 h-32  shrink-0'>
              <Image
                src={userProfile}
                alt={testimonials[currentTestimonial]?.user?.name ?? 'Customer'}
                width={128}
                height={128}
                className='rounded-full w-32 h-32 object-cover'
              />
            </div>
            <div className='flex-1'>
              <div className='flex gap-1 mb-4'>
                {[...Array(testimonials[currentTestimonial]?.rating ?? 0)].map(
                  (_, i) => (
                    <Star
                      key={i}
                      className='text-yellow-400 fill-yellow-400'
                      size={24}
                    />
                  ),
                )}
              </div>
              <p className='text-gray-700 text-lg mb-6 italic'>
                &quot;{testimonials[currentTestimonial]?.content}&quot;
              </p>
              <div>
                <p className='font-bold text-gray-900 text-xl'>
                  {testimonials[currentTestimonial]?.user?.name}
                </p>
                <p className='text-gray-500'>
                  {testimonials[currentTestimonial]?.title}
                </p>
              </div>
            </div>
          </div>

          {/* Carousel Controls */}
          <div className='flex items-center justify-center gap-4 mt-8'>
            <Button
              variant='ghost'
              size='icon'
              onClick={prevTestimonial}
              className='rounded-full'
              aria-label='Previous testimonial'
            >
              <ChevronLeft size={24} />
            </Button>

            <div className='flex gap-2'>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                  className={`h-3 rounded-full transition-all ${
                    index === currentTestimonial
                      ? 'bg-linear-to-r from-orange-500 to-yellow-500 w-8'
                      : 'bg-gray-300 w-3'
                  }`}
                />
              ))}
            </div>

            <Button
              variant='ghost'
              size='icon'
              onClick={nextTestimonial}
              className='rounded-full'
            >
              <ChevronRight size={24} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
