'use client';

import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FieldDescription } from '@/components/ui/field';
import Image from 'next/image';
import { appImages } from '@/constants/app-images';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Don't redirect while loading

    if (session) {
      const role = session.user?.role;
      switch (role) {
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        case 'STAFF':
          router.push('/staff/dashboard');
          break;
        case 'USER':
        default:
          router.push('/');
          break;
      }
    }
  }, [session, status, router]);

  // Don't render anything while redirecting or loading
  if (status === 'loading' || session) {
    return (
      <div className='bg-linear-to-br from-blue-50 via-white to-orange-50 flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
        <div className='w-full max-w-sm md:max-w-4xl'>
          <Card className='overflow-hidden p-0'>
            <CardContent className='bg-linear-to-br from-blue-100 to-orange-100 grid p-0 md:grid-cols-2'>
              <div className='p-6 md:p-8 flex items-center justify-center'>
                <div className='text-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' />
                  <p className='text-gray-600'>Redirecting...</p>
                </div>
              </div>
              <div className='bg-white relative hidden md:block'>
                <Image
                  src={appImages.logo}
                  alt='Image'
                  fill
                  className='absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale'
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className='bg-linear-to-br from-blue-50 via-white to-orange-50 flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
      {/* Back button */}
      <div className='w-full max-w-sm md:max-w-4xl mb-4'>
        <Button
          variant='ghost'
          size='sm'
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900'
          asChild
        >
          <Link href='/'>
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className='w-full max-w-sm md:max-w-4xl'>
        <div className='flex flex-col gap-6'>
          <Card className='overflow-hidden p-0'>
            <CardContent className='bg-linear-to-br from-blue-100 to-orange-100 grid p-0 md:grid-cols-2'>
              {children}
              <div className='bg-white relative hidden md:block'>
                <Image
                  src={appImages.logo}
                  alt='Image'
                  fill
                  className='absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale'
                />
              </div>
            </CardContent>
          </Card>
          <FieldDescription className='px-6 text-center'>
            By clicking continue, you agree to our{' '}
            <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
