'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
}

export function AuthRequiredDialog({
  open,
  onOpenChange,
  title = 'Login Required',
  message = 'You need to be logged in to book a service.',
}: AuthRequiredDialogProps) {
  const router = useRouter();

  const handleLoginRedirect = () => {
    onOpenChange(false);
    router.push('/login');
  };

  const handleSignUpRedirect = () => {
    onOpenChange(false);
    router.push('/signup');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Please log in or create an account to continue.
          </DialogDescription>
        </DialogHeader>

        <div className='py-6 space-y-4'>
          <p className='text-center text-gray-600'>{message}</p>
          <div className='flex gap-3 justify-center'>
            <Button
              onClick={handleLoginRedirect}
              className='flex-1 bg-blue-600 hover:bg-blue-700'
            >
              <LogIn className='mr-2' size={18} />
              Log In
            </Button>
            <Button
              variant='outline'
              onClick={handleSignUpRedirect}
              className='flex-1'
            >
              <UserPlus className='mr-2' size={18} />
              Sign Up
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
