'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Service } from '@/types/service';
import { CheckCircle, Clock, DollarSign, Tag, Users, Zap } from 'lucide-react';

interface ServiceDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | undefined;
  isLoading: boolean;
}

const ServiceDetailsSheet: React.FC<ServiceDetailsSheetProps> = ({
  open,
  onOpenChange,
  service,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className='w-full sm:max-w-lg'>
          <SheetHeader>
            <SheetTitle>Loading Service Details</SheetTitle>
            <SheetDescription>
              Please wait while we load the service information
            </SheetDescription>
          </SheetHeader>
          <div className='flex items-center justify-center h-64'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4' />
              <p className='text-lg font-medium text-gray-700'>
                Loading service details...
              </p>
              <p className='text-sm text-gray-500 mt-2'>
                Please wait while we fetch the information
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!service) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className='w-full sm:max-w-lg'>
          <SheetHeader>
            <SheetTitle>Service Not Found</SheetTitle>
            <SheetDescription>Unable to load service details</SheetDescription>
          </SheetHeader>
          <div className='flex items-center justify-center h-64'>
            <p className='text-gray-500'>No service data available</p>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant='outline'>Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-lg overflow-y-auto'>
        <SheetHeader className='pb-6'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Tag className='w-6 h-6 text-blue-600' />
            </div>
            <div>
              <SheetTitle className='text-xl'>{service.title}</SheetTitle>
              <SheetDescription className='mt-1'>
                {service.description}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className='space-y-6'>
          {/* Key Info Cards */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-linear-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200'>
              <div className='flex items-center gap-2 mb-2'>
                <Tag className='w-4 h-4 text-blue-600' />
                <span className='text-sm font-medium text-blue-700'>
                  Service Type
                </span>
              </div>
              <p className='text-lg font-bold text-blue-900'>{service.type}</p>
            </div>

            <div className='bg-linear-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200'>
              <div className='flex items-center gap-2 mb-2'>
                <DollarSign className='w-4 h-4 text-green-600' />
                <span className='text-sm font-medium text-green-700'>
                  Price
                </span>
              </div>
              <p className='text-lg font-bold text-green-900'>
                GMD {service.price}
              </p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-linear-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200'>
              <div className='flex items-center gap-2 mb-2'>
                <Clock className='w-4 h-4 text-purple-600' />
                <span className='text-sm font-medium text-purple-700'>
                  Duration
                </span>
              </div>
              <p className='text-lg font-bold text-purple-900'>
                {service.estimatedTime ?? 'N/A'}
              </p>
            </div>

            <div className='bg-linear-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200'>
              <div className='flex items-center gap-2 mb-2'>
                <Zap className='w-4 h-4 text-orange-600' />
                <span className='text-sm font-medium text-orange-700'>
                  Turnaround
                </span>
              </div>
              <p className='text-lg font-bold text-orange-900'>
                {service.turnaround}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className='bg-linear-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200'>
            <div className='flex items-center gap-2 mb-3'>
              <CheckCircle className='w-4 h-4 text-gray-600' />
              <span className='text-sm font-medium text-gray-700'>Status</span>
            </div>
            <Badge
              className={
                service.isActive
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }
            >
              {service.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Service Details Accordion */}
          <Accordion type='single' collapsible className='w-full'>
            {/* Features */}
            <AccordionItem value='features'>
              <AccordionTrigger className='flex items-center gap-2'>
                <div className='flex items-center gap-2'>
                  <Zap className='w-4 h-4 text-indigo-600' />
                  <span className='text-sm font-medium'>Features</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='pt-2'>
                  {Array.isArray(service.features) &&
                  service.features.length > 0 ? (
                    <ul className='space-y-2'>
                      {service.features.map((feature, index) => (
                        <li key={index} className='flex items-start gap-2'>
                          <CheckCircle className='w-4 h-4 text-indigo-500 mt-0.5 shrink-0' />
                          <span className='text-sm text-gray-700'>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-sm text-gray-500 italic'>
                      No features listed
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Includes */}
            <AccordionItem value='includes'>
              <AccordionTrigger className='flex items-center gap-2'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4 text-teal-600' />
                  <span className='text-sm font-medium'>What's Included</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='pt-2'>
                  {Array.isArray(service.includes) &&
                  service.includes.length > 0 ? (
                    <ul className='space-y-2'>
                      {service.includes.map((item, index) => (
                        <li key={index} className='flex items-start gap-2'>
                          <CheckCircle className='w-4 h-4 text-teal-500 mt-0.5 shrink-0' />
                          <span className='text-sm text-gray-700'>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-sm text-gray-500 italic'>
                      No inclusions listed
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Ideal For */}
            <AccordionItem value='ideal'>
              <AccordionTrigger className='flex items-center gap-2'>
                <div className='flex items-center gap-2'>
                  <Users className='w-4 h-4 text-pink-600' />
                  <span className='text-sm font-medium'>Ideal For</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='pt-2'>
                  {(() => {
                    // Handle case where ideal might be a string (from API) or array
                    let idealItems: string[];
                    if (Array.isArray(service.ideal)) {
                      idealItems = service.ideal;
                    } else if (
                      typeof (service.ideal as any) === 'string' &&
                      service.ideal.trim()
                    ) {
                      // Split comma-separated string and trim each item
                      idealItems = service.ideal
                        .split(',')
                        .map(item => item.trim())
                        .filter(item => item.length > 0);
                    } else {
                      idealItems = [];
                    }

                    return idealItems.length > 0 ? (
                      <ul className='space-y-2'>
                        {idealItems.map((ideal, index) => (
                          <li key={index} className='flex items-start gap-2'>
                            <Users className='w-4 h-4 text-pink-500 mt-0.5 shrink-0' />
                            <span className='text-sm text-gray-700'>
                              {ideal}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className='text-sm text-gray-500 italic'>
                        No ideal uses listed
                      </p>
                    );
                  })()}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <SheetFooter className='mt-6'>
          <SheetClose asChild>
            <Button variant='outline' className='w-full'>
              Close Details
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ServiceDetailsSheet;
