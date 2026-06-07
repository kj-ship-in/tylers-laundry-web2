'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  resendVerificationCodeService,
  verifyEmailService,
} from '@/services/auth';

interface Props {
  open: boolean;
  email: string;
  onClose: () => void;
}

export function VerifyEmailModal({ open, email, onClose }: Props) {
  const router = useRouter();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (open) {
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async () => {
    const code = digits.join('');
    if (code.length < 6) return;
    setIsLoading(true);
    setError(null);
    try {
      await verifyEmailService(email, code);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Verification failed. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    try {
      await resendVerificationCodeService(email);
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code.');
    }
  };

  const isComplete = digits.join('').length === 6;

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader className='text-center sm:text-center'>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription>
            We sent a 6-digit code to{' '}
            <span className='font-medium text-foreground'>{email}</span>. Enter
            it below to activate your account.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <Alert className='border-green-500 bg-green-50'>
            <AlertDescription className='text-green-800'>
              Email verified! Welcome to Tyler&apos;s Laundry. Redirecting to
              login...
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {error && (
              <Alert className='border-red-500 bg-red-50'>
                <AlertDescription className='text-red-800'>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className='flex justify-center gap-2' onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => {
                    inputRefs.current[i] = el;
                  }}
                  type='text'
                  inputMode='numeric'
                  maxLength={1}
                  value={digit}
                  aria-label={`Digit ${i + 1}`}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className='h-12 w-10 rounded-md border border-input bg-background text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-ring'
                />
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isComplete || isLoading}
              className='w-full bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
            >
              {isLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </Button>

            <p className='text-center text-sm text-muted-foreground'>
              Didn&apos;t receive it?{' '}
              {cooldown > 0 ? (
                <span>Resend in {cooldown}s</span>
              ) : (
                <button
                  type='button'
                  onClick={handleResend}
                  className='underline hover:text-foreground'
                >
                  Resend code
                </button>
              )}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
