'use client';

import { Button } from '@/components/ui/button';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import loginFormSchema, {
  type LoginFormValues,
} from '@/utils/schemas/login-schema';
import { Form } from './ui/form';
import { Mail, Lock } from 'lucide-react';
import TextInputField from './form/text-input-field';
import { Alert, AlertDescription } from './ui/alert';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { update } = useSession();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        // Display the error message from backend or NextAuth
        setError(result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        const newSession = await update();
        const role = (newSession?.user as any)?.role;
        const redirectUrl =
          role === 'ADMIN'
            ? '/admin/dashboard'
            : role === 'STAFF'
              ? '/staff/dashboard'
              : '/';
        router.push(redirectUrl);
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='p-6 md:p-8'>
        <FieldGroup>
          <div className='flex flex-col items-center gap-2 text-center'>
            <h1 className='text-2xl font-bold'>Welcome back</h1>
            <p className='text-muted-foreground text-balance'>
              Login to your account
            </p>
          </div>
          {error && (
            <Alert className='border-red-500 bg-red-50'>
              <AlertDescription className='text-red-500'>
                {error}
              </AlertDescription>
            </Alert>
          )}
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
          <Field className='relative'>
            <div className='absolute right-0 flex justify-end items-center'>
              <Link
                href='#'
                className='ml-auto text-sm underline-offset-2 hover:underline'
              >
                Forgot your password?
              </Link>
            </div>
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
            <Button
              type='submit'
              className='w-full bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
              disabled={!form.formState.isValid || isLoading}
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </Button>
          </Field>

          <FieldDescription className='text-center'>
            Don&apos;t have an account? <Link href='/signup'>Sign up</Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </Form>
  );
}
