'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import { useTestimonialStats } from '@/hooks/useTestimonials';

export function TestimonialsStats() {
  const { data: stats, isLoading, error } = useTestimonialStats();

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className='animate-pulse'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 bg-gray-200 rounded w-24' />
              <div className='h-4 w-4 bg-gray-200 rounded' />
            </CardHeader>
            <CardContent>
              <div className='h-8 bg-gray-200 rounded w-16 mb-1' />
              <div className='h-3 bg-gray-200 rounded w-20' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    // Check if it's a 403 Forbidden error
    const isForbidden = (error as any)?.response?.status === 403;

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='col-span-full'>
          <CardContent className='flex items-center justify-center h-32'>
            <div className='text-center'>
              {isForbidden ? (
                <>
                  <div className='text-red-500 mb-2'>
                    <svg
                      className='w-8 h-8 mx-auto'
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
                  <p className='text-gray-700 font-medium'>Access Restricted</p>
                  <p className='text-gray-500 text-sm'>
                    You don't have permission to view testimonial statistics
                  </p>
                </>
              ) : (
                <p className='text-gray-500'>
                  Failed to load testimonials statistics
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Reviews',
      value: stats.totalCount ?? 0,
      icon: Users,
      description: 'All time testimonials',
      color: 'text-blue-600',
    },
    {
      title: 'Approved',
      value: stats.approvedCount ?? 0,
      icon: CheckCircle,
      description: `${stats.totalCount > 0 ? ((stats.approvedCount / stats.totalCount) * 100).toFixed(1) : 0}% approval rate`,
      color: 'text-green-600',
    },
    {
      title: 'Pending',
      value: stats.pendingCount ?? 0,
      icon: Clock,
      description: 'Awaiting approval',
      color: 'text-yellow-600',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating ? stats.averageRating.toFixed(1) : '0.0',
      icon: Star,
      description: 'Out of 5 stars',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-sm text-muted-foreground'>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {[5, 4, 3, 2, 1].map(rating => {
              const ratingData = stats.ratingDistribution?.find(
                item => item.rating === rating,
              );
              const count = ratingData?.count ?? 0;
              const percentage =
                stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;

              return (
                <div key={rating} className='flex items-center space-x-4'>
                  <div className='flex items-center space-x-1 w-16'>
                    <span className='text-sm font-medium'>{rating}</span>
                    <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                  </div>
                  <div className='flex-1'>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-yellow-400 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className='text-sm text-gray-600 w-12 text-right'>
                    {count}
                  </div>
                  <div className='text-sm text-gray-500 w-12 text-right'>
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
