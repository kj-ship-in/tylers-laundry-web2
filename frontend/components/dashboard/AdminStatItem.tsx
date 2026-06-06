import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatItemProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down';
  color?: string;
}

export const AdminStatItem: React.FC<StatItemProps> = ({
  title,
  value,
  icon: Icon,
  change,
  trend,
}) => {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition'>
      <div className='flex items-center justify-between mb-4'>
        <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center'>
          <Icon className='text-gray-600' size={24} />
        </div>
        {change &&
          trend &&
          (trend === 'up' ? (
            <span className='flex items-center gap-1 text-green-600 text-sm font-medium'>
              <TrendingUp size={16} />
              {change}
            </span>
          ) : (
            <span className='flex items-center gap-1 text-red-600 text-sm font-medium'>
              <TrendingDown size={16} />
              {change}
            </span>
          ))}
      </div>
      <h3 className='text-gray-500 text-sm mb-1'>{title}</h3>
      <p className='text-3xl font-bold text-gray-900'>{value}</p>
    </div>
  );
};
