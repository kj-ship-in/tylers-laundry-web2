import React from 'react';
import { AdminStatItem } from './AdminStatItem';
import { AdminStatSkeleton } from './AdminStatSkeleton';
import type { LucideIcon } from 'lucide-react';

interface AdminStat {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down';
  color?: string;
}

interface AdminStatsGridProps {
  stats: AdminStat[];
  isLoading?: boolean;
}

export const AdminStatsGrid: React.FC<AdminStatsGridProps> = ({
  stats,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {[...Array(4)].map((_, i) => (
          <AdminStatSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {stats.map((stat, index) => (
        <AdminStatItem key={`${stat.title}-${index}`} {...stat} />
      ))}
    </div>
  );
};
