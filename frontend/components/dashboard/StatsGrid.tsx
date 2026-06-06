import React from 'react';
import { StatsCard } from './StatsCard';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface Stat {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface StatsGridProps {
  stats: Stat[];
  isLoading?: boolean;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Skeleton
            key={i}
            className='h-32 bg-gray-200 rounded-lg animate-pulse'
          />
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {stats.map((stat, index) => (
        <StatsCard key={`${stat.title}-${index}`} {...stat} />
      ))}
    </div>
  );
};
