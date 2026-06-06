import { services } from '@/mocks/dummy-data';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { ArrowRight, Check, Clock, Package, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import type { Service } from '@/types/service';
import { formatToGMD } from '@/utils/helpers';

type ServiceDetailDialogProps = {
  selectedService: Service | null;
  onClose: () => void;
  onBook?: React.MouseEventHandler<HTMLButtonElement>;
};

const ServiceDetailDialog = ({
  selectedService,
  onClose,
  onBook,
}: ServiceDetailDialogProps) => {
  if (selectedService === null) return null;

  return (
    <Dialog open={selectedService !== null} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='w-16 h-16 bg-linear-to-br from-orange-500 to-yellow-500 hover:from-orange-600 rounded-xl flex items-center justify-center mb-4'>
            <span className='text-3xl'>🧺</span>
          </div>
          <DialogTitle className='text-3xl font-bold'>
            {selectedService.title}
          </DialogTitle>
          <DialogDescription className='text-4xl font-bold bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent'>
            From {formatToGMD(selectedService.price)}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 mt-4'>
          <p className='text-gray-600 text-lg'>{selectedService.description}</p>

          <div className='grid md:grid-cols-2 gap-4'>
            <div className='bg-blue-50 rounded-xl p-6'>
              <h3 className='font-bold text-gray-900 mb-3 flex items-center gap-2'>
                <Clock className='text-blue-600' size={20} />
                Turnaround Time
              </h3>
              <p className='text-gray-700'>{selectedService.turnaround}</p>
            </div>

            <div className='bg-orange-50 rounded-xl p-6'>
              <h3 className='font-bold text-gray-900 mb-3 flex items-center gap-2'>
                <Sparkles className='text-orange-600' size={20} />
                Ideal For
              </h3>
              <p className='text-gray-700'>{selectedService.ideal}</p>
            </div>
          </div>

          <div>
            <h3 className='font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <Package className='text-blue-600' size={20} />
              What&apos;s Included
            </h3>
            <div className='grid md:grid-cols-2 gap-3'>
              {selectedService.includes.map((item, idx) => (
                <div key={idx} className='flex items-center gap-2'>
                  <Check className='text-green-500 shrink-0' size={18} />
                  <span className='text-gray-700'>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={onBook}
            className='w-full py-6 bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-lg'
          >
            Book This Service
            <ArrowRight size={20} className='ml-2' />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceDetailDialog;
