import React from 'react';
import { Button } from './ui/button';
import { Check, RefreshCw, AlertCircle, Package } from 'lucide-react';
import { serviceImage } from '@/mocks/dummy-data';
import Image from 'next/image';
import type { Service } from '@/types/service';
import { useFetchPublicServices } from '@/hooks/useServicesQuery';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { formatToGMD } from '@/utils/helpers';

type ServicesProps = {
  setSelectedService: React.Dispatch<React.SetStateAction<Service | null>>;
};

// Loading Skeleton Component
const ServiceCardSkeleton = () => (
  <div className='bg-white rounded-2xl p-8 border-2 border-gray-100'>
    <Skeleton className='w-full h-40 rounded-xl mb-6' />
    <Skeleton className='h-8 w-3/4 mb-2' />
    <Skeleton className='h-10 w-1/2 mb-4' />
    <Skeleton className='h-4 w-full mb-2' />
    <Skeleton className='h-4 w-5/6 mb-6' />
    <div className='space-y-3 mb-6'>
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-full' />
      <Skeleton className='h-4 w-4/5' />
    </div>
    <Skeleton className='h-10 w-full rounded-md' />
  </div>
);

const Services: React.FC<ServicesProps> = ({ setSelectedService }) => {
  const {
    data: services,
    isFetching,
    error,
    refetch,
  } = useFetchPublicServices();

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='text-center mb-16'>
        <h2 className='text-4xl font-bold text-gray-900 mb-4'>Our Services</h2>
        <p className='text-xl text-gray-600'>
          Professional care for all your laundry needs
        </p>
      </div>

      {/* Loading State */}
      {isFetching && (
        <div className='grid md:grid-cols-3 gap-8'>
          {[1, 2, 3].map(index => (
            <ServiceCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isFetching && error && (
        <div className='max-w-2xl mx-auto'>
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error Loading Services</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : 'Failed to load services. Please try again.'}
            </AlertDescription>
          </Alert>
          <div className='flex justify-center'>
            <Button
              onClick={() => refetch()}
              variant='outline'
              className='gap-2'
            >
              <RefreshCw className='h-4 w-4' />
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isFetching && !error && (!services || services.length === 0) && (
        <div className='text-center py-16'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6'>
            <Package className='h-10 w-10 text-gray-400' />
          </div>
          <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
            No Services Available
          </h3>
          <p className='text-gray-600 mb-6'>
            There are currently no services to display.
          </p>
          <Button onClick={() => refetch()} variant='outline' className='gap-2'>
            <RefreshCw className='h-4 w-4' />
            Refresh
          </Button>
        </div>
      )}

      {/* Success State - Display Services */}
      {!isFetching && !error && services && services.length > 0 && (
        <div className='grid md:grid-cols-3 gap-8'>
          {services.map((service, index) => (
            <div
              key={index}
              className='bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-400 hover:shadow-xl transition-all transform hover:-translate-y-2'
            >
              <div className='w-full h-40 bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-xl flex items-center justify-center mb-6'>
                <Image
                  src={serviceImage(service.type)}
                  alt={service.title}
                  width={500}
                  height={500}
                  priority
                  className='object-fill w-full h-40 rounded-xl'
                />
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                {service.title}
              </h3>
              <p className='text-3xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4'>
                From {formatToGMD(service.price)}
              </p>
              <p className='text-gray-600 mb-6'>{service.description}</p>
              <ul className='space-y-3 mb-6'>
                {service.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className='flex items-center gap-2 text-gray-700'
                  >
                    <Check className='text-green-500 shrink-0' size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setSelectedService(service)}
                className='w-full bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              >
                Learn More
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
