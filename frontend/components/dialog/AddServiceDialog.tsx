'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, type FieldArrayPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

import type { ServiceFormValues } from '@/utils/schemas/service.schema';
import {
  serviceFormSchema,
  createServiceSchema,
  updateServiceSchema,
} from '@/utils/schemas/service.schema';
import { useCreateService, useUpdateService } from '@/hooks/useServicesQuery';
import type { Service } from '@/types/service';

type FormData = ServiceFormValues;

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null; // For edit mode
  onSuccess?: (message: string) => void;
}

const AddServiceDialog: React.FC<AddServiceDialogProps> = ({
  open,
  onOpenChange,
  service = null,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!service;
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  const form = useForm<FormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: '',
      type: '',
      description: '',
      price: 0,
      features: [{ value: '' }],
      turnaround: '',
      includes: [{ value: '' }],
      estimatedTime: '',
      isActive: true,
    },
    mode: 'onChange',
  });

  // Reset form when service prop changes or dialog opens
  React.useEffect(() => {
    if (open && service) {
      // Edit mode - populate with service data
      form.reset({
        title: service.title,
        type: service.type,
        description: service.description || '',
        price: service.price,
        features: service.features.map(f => ({ value: f })),
        turnaround: service.turnaround || '',
        includes: service.includes.map(i => ({ value: i })),
        ideal: service.ideal
          ? Array.isArray(service.ideal)
            ? service.ideal.map(i => ({ value: i }))
            : typeof service.ideal === 'string' && service.ideal.trim()
              ? service.ideal.split(',').map(i => ({ value: i.trim() }))
              : [{ value: '' }]
          : [{ value: '' }],
        estimatedTime: service.estimatedTime || '',
        isActive: service.isActive,
      });
    } else if (open && !service) {
      // Create mode - reset to empty form
      form.reset({
        title: '',
        type: '',
        description: '',
        price: 0,
        features: [{ value: '' }],
        turnaround: '',
        includes: [{ value: '' }],
        ideal: [{ value: '' }],
        estimatedTime: '',
        isActive: true,
      });
    }
  }, [open, service, form]);

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray<FormData>({
    control: form.control,
    name: 'features',
  });

  const {
    fields: includeFields,
    append: appendInclude,
    remove: removeInclude,
  } = useFieldArray<FormData>({
    control: form.control,
    name: 'includes',
  });
  const {
    fields: idealFields,
    append: appendIdeal,
    remove: removeIdeal,
  } = useFieldArray<FormData>({
    control: form.control,
    name: 'ideal',
  });
  const onSubmit = async (values: FormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // For edit mode, allow empty fields and only send changed values
      let cleanedValues: any = { ...values };

      if (isEditMode) {
        // For edit mode, filter out empty strings and prepare data
        cleanedValues = {
          ...values,
          price: values.price,
          features: values.features
            .map(f => f.value)
            .filter(f => f.trim() !== ''),
          includes: values.includes
            .map(i => i.value)
            .filter(i => i.trim() !== ''),
          ideal: values.ideal
            ? values.ideal
                .map(i => i.value)
                .filter(i => i.trim() !== '')
                .join(', ')
            : '',
        };
      } else {
        // For create mode, validate required fields
        cleanedValues = {
          ...values,
          features: values.features
            .map(f => f.value)
            .filter(f => f.trim() !== ''),
          includes: values.includes
            .map(i => i.value)
            .filter(i => i.trim() !== ''),
          ideal: values.ideal
            ? values.ideal
                .map(i => i.value)
                .filter(i => i.trim() !== '')
                .join(', ')
            : '',
        };
      }

      if (isEditMode && service) {
        await updateServiceMutation.mutateAsync({
          serviceId: service._id,
          updateData: cleanedValues,
        });
      } else {
        await createServiceMutation.mutateAsync(cleanedValues);
      }

      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      setError(null); // Clear any previous errors

      // Call success callback
      if (onSuccess) {
        onSuccess(
          isEditMode
            ? 'Service updated successfully!'
            : 'Service created successfully!',
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isEditMode ? 'update' : 'create'} service`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the service information below.'
              : 'Create a new service for your laundry business. Fill in all the required information below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Basic Information */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., Premium Wash & Fold'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type *</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., Wash & Fold' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Describe the service...'
                      className='min-h-20'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing and Timing */}
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (GMD) *</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                        onChange={e =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='turnaround'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turnaround Time</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., 24 hours' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='estimatedTime'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g., 2-3 hours' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Features */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <FormLabel>Features *</FormLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => appendFeature({ value: '' })}
                  >
                    <Plus className='w-4 h-4 mr-1' />
                    Add Feature
                  </Button>
                </div>
                <div className='space-y-2'>
                  {featureFields.map((field, index) => (
                    <div key={field.id || index} className='flex gap-2'>
                      <FormField
                        control={form.control}
                        name={`features.${index}.value`}
                        render={({ field }) => (
                          <FormItem className='flex-1'>
                            <FormControl>
                              <Input
                                placeholder='Enter a feature...'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {featureFields.length > 1 && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => removeFeature(index)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Includes */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <FormLabel>What's Included *</FormLabel>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => appendInclude({ value: '' })}
                  >
                    <Plus className='w-4 h-4 mr-1' />
                    Add Item
                  </Button>
                </div>
                <div className='space-y-2'>
                  {includeFields.map((field, index) => (
                    <div key={field.id || index} className='flex gap-2'>
                      <FormField
                        control={form.control}
                        name={`includes.${index}.value`}
                        render={({ field }) => (
                          <FormItem className='flex-1'>
                            <FormControl>
                              <Input
                                placeholder="Enter what's included..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {includeFields.length > 1 && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => removeInclude(index)}
                        >
                          <X className='w-4 h-4' />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ideal For */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <FormLabel>Ideal For</FormLabel>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => appendIdeal({ value: '' })}
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Add Item
                </Button>
              </div>
              <div className='space-y-2'>
                {idealFields.map((field, index) => (
                  <div key={field.id} className='flex gap-2'>
                    <FormField
                      control={form.control}
                      name={`ideal.${index}.value`}
                      render={({ field }) => (
                        <FormItem className='flex-1'>
                          <FormControl>
                            <Input
                              placeholder='e.g., Business professionals'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {idealFields.length > 1 && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => removeIdeal(index)}
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <FormField
              control={form.control}
              name='isActive'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Active Service</FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      Make this service available to customers
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditMode ? (
                  'Update Service'
                ) : (
                  'Create Service'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceDialog;
