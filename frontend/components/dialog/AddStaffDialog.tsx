'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createAccountService } from '@/services/auth';
import type { CreateAccountFormValues } from '@/utils/schemas/create-account-schema';
import createAccountFormSchema from '@/utils/schemas/create-account-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User2, Lock } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import TextInputField from '../form/text-input-field';
import { Form } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { useCreateStaffMutation } from '@/hooks/useAdminQuries';
import { toast } from 'sonner';

interface AddStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddStaffDialog({ isOpen, onClose }: AddStaffDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const { mutateAsync: createStaff, isPending: isCreatingStaff } =
    useCreateStaffMutation({
      onSuccess: () => {
        onClose();
        toast.success('Staff account created successfully');
      },
      onError: (error: any) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create staff account';
        setError(errorMessage);
      },
    });

  // Define a submit handler.
  const onSubmit = async (values: CreateAccountFormValues) => {
    await createStaff(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px] '>
        <DialogHeader>
          <DialogTitle>Add New Staff</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='p-6 md:p-8'>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <p className='text-muted-foreground text-sm text-balance'>
                  Enter the details below to create a new staff account
                </p>
              </div>

              {error && (
                <Alert className='border-red-500 bg-red-50'>
                  <AlertDescription className='text-red-800'>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Field>
                <TextInputField
                  control={form.control}
                  prefixIcon={User2}
                  label='Full Name'
                  name='name'
                  placeholder='Enter full name'
                  type='text'
                />
              </Field>
              <Field>
                <TextInputField
                  control={form.control}
                  prefixIcon={Mail}
                  label='Email'
                  name='email'
                  placeholder='Enter email'
                  type='email'
                />
              </Field>
              <Field>
                <TextInputField
                  control={form.control}
                  label='Phone Number'
                  name='phone'
                  placeholder='Enter phone number (optional)'
                  type='tel'
                />
              </Field>
              <Field>
                <TextInputField
                  control={form.control}
                  label='Address'
                  name='address'
                  placeholder='Enter address (optional)'
                  type='text'
                />
              </Field>

              <Field>
                <TextInputField
                  control={form.control}
                  prefixIcon={Lock}
                  label='Password'
                  name='password'
                  placeholder='Your password'
                  type='password'
                  togglePassword={togglePasswordVisibility}
                  secureEntry
                  isPasswordVisible={showPassword}
                />
              </Field>
              <Field>
                <TextInputField
                  control={form.control}
                  prefixIcon={Lock}
                  label='Confirm Password'
                  name='confirmPassword'
                  placeholder='Confirm your password'
                  type='password'
                  togglePassword={toggleConfirmPasswordVisibility}
                  secureEntry
                  isPasswordVisible={showConfirmPassword}
                />
              </Field>
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
              <Field>
                <Button
                  type='submit'
                  className='w-full bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
                  disabled={!form.formState.isValid || isCreatingStaff}
                >
                  {isCreatingStaff ? (
                    <div className='flex items-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                      Creating Account...
                    </div>
                  ) : (
                    'Create Staff Account'
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
