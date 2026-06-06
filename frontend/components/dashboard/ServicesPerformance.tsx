import React, { useMemo } from 'react';
import { Package, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NoData from '@/components/no -data';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceStats {
  name: string;
  type?: string;
  description?: string;
  orders: number;
  basePrice: number;
  totalRevenue: number;
}

interface ServicesPerformanceProps {
  services?: ServiceStats[];
  isLoading?: boolean;
}

const ServiceCard: React.FC<{ service: ServiceStats }> = ({ service }) => {
  return (
    <div className='border-2 border-gray-100 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition'>
      <div className='flex items-start justify-between mb-4'>
        <div className='w-12 h-12 bg-linear-to-br from-blue-400 to-orange-400 rounded-lg flex items-center justify-center'>
          <Package className='text-white' size={24} />
        </div>
        <Button className='p-1 bg-gray-100 hover:bg-gray-100 rounded transition'>
          <MoreVertical size={18} className='text-gray-400' />
        </Button>
      </div>
      <h3 className='font-bold text-gray-900 mb-2'>{service.name}</h3>
      <p className='text-2xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4'>
        GMD {service.basePrice ?? 0}
      </p>
      <div className='space-y-2 text-sm'>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Orders:</span>
          <span className='font-semibold text-gray-900'>
            {service.orders ?? 0}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-600'>Revenue:</span>
          <span className='font-semibold text-green-600'>
            GMD {service.totalRevenue ?? 0}
          </span>
        </div>
      </div>
      <div className='mt-4 pt-4 border-t border-gray-100 flex gap-2'>
        <button className='flex-1 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm font-medium'>
          Edit
        </button>
        <button className='flex-1 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition text-sm font-medium'>
          View
        </button>
      </div>
    </div>
  );
};

const ServiceSkeleton = () => {
  return (
    <div className='border-2 border-gray-100 rounded-xl p-6'>
      <div className='flex items-start justify-between mb-4'>
        <Skeleton className='w-12 h-12 rounded-lg' />
        <Skeleton className='w-6 h-6 rounded' />
      </div>
      <Skeleton className='h-6 w-24 mb-2' />
      <Skeleton className='h-8 w-20 mb-4' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-4 w-32' />
      </div>
      <div className='mt-4 pt-4 border-t border-gray-100 flex gap-2'>
        <Skeleton className='flex-1 h-8' />
        <Skeleton className='flex-1 h-8' />
      </div>
    </div>
  );
};

const ServicesPerformance: React.FC<ServicesPerformanceProps> = ({
  services = [],
  isLoading = false,
}) => {
  return (
    <div className='bg-white rounded-xl shadow-sm border border-gray-200'>
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>
              Services Performance
            </h2>
            <p className='text-sm text-gray-500 mt-1'>
              Overview of all laundry services
            </p>
          </div>
          <button className='px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:shadow-lg transition font-medium'>
            <Package size={18} className='inline mr-2' />
            Add Service
          </button>
        </div>
      </div>
      <div className='p-6'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {isLoading ? (
            [...Array(4)].map((_, i) => <ServiceSkeleton key={i} />)
          ) : services.length > 0 ? (
            services.map((service, index) => (
              <ServiceCard key={`${service.name}-${index}`} service={service} />
            ))
          ) : (
            <Card className='col-span-full bg-white rounded-xl shadow-sm border border-gray-200'>
              <CardContent className='p-6'>
                <NoData
                  compact
                  title='No Services Data'
                  description='No services performance data available at the moment.'
                  onRefresh={() => {}}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPerformance;
