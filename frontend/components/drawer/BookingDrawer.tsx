'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '../ui/drawer';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import TextInputField from '../form/text-input-field';
import SelectInput from '../form/select-input';
import TextareaField from '../form/textarea-field';
import DatePickerInput from '../custom-date-picker';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar } from 'lucide-react';
import { SelectContent, SelectItem } from '../ui/select';
import type { BookingFormValues } from '@/utils/schemas/booking.schema';
import { createBookingSchema } from '@/utils/schemas/booking.schema';
import {
  useFetchPublicServices,
  useFetchServices,
} from '@/hooks/useServicesQuery';
import { useCreateBooking } from '@/hooks/useBookingsQuery';
import LoadingSpinnerSmall from '../loadings/loading-spinner-small';
import type { Service } from '@/types/service';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Spinner } from '../ui/spinner';

type BookingDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const BookingDrawer = ({ open, onOpenChange }: BookingDrawerProps) => {
  const {
    data: services,
    isFetching,
    error,
    refetch,
  } = useFetchPublicServices();
  const {
    mutate: createNewBooking,
    isPending,
    error: bookingError,
  } = useCreateBooking();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showBookingError, setShowBookingError] = useState(true);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      serviceId: '',
      pickupTime: '',
      date: '',
      pickupAddress: '',
      deliveryAddress: '',
      note: '',
    },
  });

  // Watch serviceId to calculate totalAmount when service changes
  const selectedServiceId = useWatch({
    control: form.control,
    name: 'serviceId',
  });
  const selectedService = services?.find(
    (s: Service) => s._id.toString() === selectedServiceId,
  ) as Service;

  // Compute totalAmount from selectedService
  const totalAmount = selectedService ? selectedService.price || 0 : 0;

  // Update serviceType when service is selected
  useEffect(() => {
    if (selectedService) {
      form.setValue('serviceType', selectedService.title);
    }
  }, [selectedService, form]);

  const onSubmit = (values: BookingFormValues) => {
    if (!termsAccepted) {
      form.setError('root', {
        type: 'manual',
        message: 'You must accept the terms and conditions',
      });
      return;
    }

    createNewBooking(
      { ...values, serviceId: Number(values.serviceId), totalAmount },
      {
        onSuccess: () => {
          form.reset();
          setTermsAccepted(false);
          onOpenChange(false);
          toast.success('Booking created successfully!');
        },
        onError: error => {
          setShowBookingError(true);
          toast.error(error?.message || 'Failed to create booking.');
        },
      },
    );
  };

  // Debug: Log form state
  const formErrors = form.formState.errors;
  const isFormValid = form.formState.isValid;
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='max-h-[90vh]'>
        <div className='overflow-y-auto px-4'>
          <DrawerHeader>
            <DrawerTitle className='text-2xl'>Book Your Service</DrawerTitle>
            <DrawerDescription>
              Fill in your details and we&apos;ll schedule a pickup
            </DrawerDescription>
          </DrawerHeader>

          <div className='px-4 pb-8'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-6'
              >
                {bookingError && showBookingError && (
                  <Alert className='border-red-500 bg-red-50 relative pr-8'>
                    <AlertDescription className='text-red-800'>
                      {typeof bookingError === 'string'
                        ? bookingError
                        : 'Failed to create booking. Please try again.'}
                    </AlertDescription>
                    <Button
                      size='icon'
                      onClick={() => setShowBookingError(false)}
                      className='absolute top-3 right-3 text-red-600 hover:text-red-800 transition-colors'
                      type='button'
                      aria-label='Close alert'
                    >
                      <X size={18} />
                    </Button>
                  </Alert>
                )}

                {form.formState.errors.root && (
                  <Alert className='border-red-500 bg-red-50'>
                    <AlertDescription className='text-red-800'>
                      {form.formState.errors.root.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Debug: Show validation errors */}
                {Object.keys(formErrors).length > 0 && (
                  <Alert className='border-yellow-500 bg-yellow-50'>
                    <AlertDescription className='text-yellow-800 text-xs'>
                      Validation errors: {Object.keys(formErrors).join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
                <div className='grid md:grid-cols-3 gap-4'>
                  <SelectInput
                    name='serviceId'
                    control={form.control}
                    label='Select Service'
                    placeholder='Choose a service...'
                    disabled={isFetching}
                  >
                    {services && services.length > 0 ? (
                      services.map((service: Service) => (
                        <SelectItem
                          key={service._id}
                          value={service._id.toString()}
                        >
                          {service.title} - From GMD {service.price}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value='' disabled>
                        {isFetching ? (
                          <div className='flex items-center gap-2'>
                            <Spinner />
                            Loading services...
                          </div>
                        ) : (
                          'No services available'
                        )}
                      </SelectItem>
                    )}
                  </SelectInput>
                  <DatePickerInput
                    name='date'
                    control={form.control}
                    label='Pickup Date'
                    placeholder='Pick a date'
                    dateFormat='yyyy-MM-dd:HH:mm:ss'
                  />
                  <FormField
                    control={form.control}
                    name='pickupTime'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Time</FormLabel>
                        <FormControl>
                          <Input type='time' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  <TextareaField
                    name='pickupAddress'
                    control={form.control}
                    label='Pickup Address'
                    placeholder='Enter your complete address...'
                    rows={3}
                  />
                  <TextareaField
                    name='deliveryAddress'
                    control={form.control}
                    label='Delivery Address (Optional)'
                    placeholder='Enter your complete address...'
                    rows={3}
                  />
                </div>

                <TextareaField
                  name='note'
                  control={form.control}
                  label='Special Instructions (Optional)'
                  placeholder='Any special requests or notes...'
                  rows={3}
                />

                {selectedService && (
                  <div className='border border-blue-200 bg-blue-50 p-4 rounded-lg space-y-2'>
                    <h3 className='font-semibold text-gray-800'>
                      Pricing Summary
                    </h3>
                    <div className='flex justify-between text-sm text-gray-700'>
                      <span>{(selectedService as any).title}</span>
                      <span>GMD {(selectedService as any).price}</span>
                    </div>
                    {(selectedService as any).deliveryFee > 0 && (
                      <div className='flex justify-between text-sm text-gray-700'>
                        <span>Delivery Fee</span>
                        <span>GMD {(selectedService as any).deliveryFee}</span>
                      </div>
                    )}
                    <div className='border-t border-blue-200 pt-2 flex justify-between font-semibold text-gray-900'>
                      <span>Total Amount</span>
                      <span>GMD {totalAmount}</span>
                    </div>
                  </div>
                )}

                <div className='flex items-center space-x-2 bg-blue-50 p-4 rounded-lg'>
                  <Checkbox
                    id='terms'
                    checked={termsAccepted}
                    onCheckedChange={checked =>
                      setTermsAccepted(checked as boolean)
                    }
                  />
                  <label
                    htmlFor='terms'
                    className='text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    I agree to the terms and conditions and understand that
                    pricing will be confirmed after garment inspection.
                  </label>
                </div>

                <DrawerFooter className='flex justify-center items-center flex-row gap-32'>
                  <Button
                    type='submit'
                    disabled={isPending || !termsAccepted || !isFormValid}
                    title={
                      !isFormValid
                        ? `Form invalid. Errors: ${Object.keys(formErrors).join(', ')}`
                        : !termsAccepted
                          ? 'Please accept terms'
                          : isPending
                            ? 'Submitting...'
                            : ''
                    }
                    className='w-52 py-6 bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-lg disabled:opacity-50 cursor-pointer'
                  >
                    {isPending ? (
                      <div className='flex items-center gap-2'>
                        <LoadingSpinnerSmall size='w-4 h-4' />
                        Scheduling...
                      </div>
                    ) : (
                      <>
                        Schedule Pickup
                        <Calendar size={20} className='ml-2' />
                      </>
                    )}
                  </Button>
                  <DrawerClose asChild>
                    <Button
                      variant='outline'
                      className='w-52'
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default BookingDrawer;
