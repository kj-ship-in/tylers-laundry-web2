import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

export const StatsCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
}) => {
  return (
    <div
      className={`bg-linear-to-br ${color} rounded-lg p-6 text-white shadow-lg`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium opacity-90'>{title}</p>
          <p className='text-2xl font-bold mt-2'>{value}</p>
        </div>
        <div className='p-3 bg-white/20 rounded-lg'>
          <Icon className='w-6 h-6' />
        </div>
      </div>
    </div>
  );
};
