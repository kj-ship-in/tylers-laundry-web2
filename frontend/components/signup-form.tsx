'use client';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createAccountService } from '@/services/auth';
import type { CreateAccountFormValues } from '@/utils/schemas/create-account-schema';
import createAccountFormSchema from '@/utils/schemas/create-account-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import TextInputField from './form/text-input-field';
import { Form } from './ui/form';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from './ui/alert';

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<CreateAccountFormValues>({
    resolver: zodResolver(createAccountFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // 2. Define a submit handler.
  const onSubmit = async (values: CreateAccountFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await createAccountService(values);

      if (data) {
        router.push('/login');
      } else {
        setError('Error creating account. Please try again.');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create account';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='p-6 md:p-8'>
        <FieldGroup>
          <div className='flex flex-col items-center gap-2 text-center'>
            <h1 className='text-2xl font-bold'>Create your account</h1>
            <p className='text-muted-foreground text-sm text-balance'>
              Enter your email below to create your account
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
            <Field>
              <TextInputField
                prefixIcon={User2}
                label='Full Name'
                name='name'
                control={form.control}
                placeholder='Enter full name'
                type='text'
              />
            </Field>
            <Field>
              <TextInputField
                prefixIcon={Mail}
                label='Email'
                name='email'
                control={form.control}
                placeholder='Enter email'
                type='email'
              />
            </Field>

            <Field>
              <TextInputField
                prefixIcon={Lock}
                label='Password'
                name='password'
                control={form.control}
                placeholder='Your password'
                type='password'
                togglePassword={togglePasswordVisibility}
                secureEntry
                isPasswordVisible={showPassword}
              />
              <FieldDescription>
                Must be at least 8 characters with an uppercase letter and a
                number.
              </FieldDescription>
            </Field>
            <Field>
              <TextInputField
                prefixIcon={Lock}
                label='Confirm Password'
                name='confirmPassword'
                control={form.control}
                placeholder='Confirm your password'
                type='password'
                togglePassword={toggleConfirmPasswordVisibility}
                secureEntry
                isPasswordVisible={showConfirmPassword}
              />
            </Field>
          </Field>
          <Field>
            <Button
              type='submit'
              className='w-full bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
              disabled={!form.formState.isValid || isLoading}
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </Field>
          <FieldDescription className='text-center text-xs text-muted-foreground'>
            By creating an account, you agree to our{' '}
            <a
              href='https://www.termsfeed.com/live/9f6d2535-df44-4982-b4a6-bd91d89fdabf'
              target='_blank'
              rel='noopener noreferrer'
              className='underline hover:text-foreground'
            >
              Privacy Policy
            </a>
            .
          </FieldDescription>
          <FieldDescription className='text-center'>
            Already have an account? <Link href='/login'>Sign In</Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </Form>
  );
}
