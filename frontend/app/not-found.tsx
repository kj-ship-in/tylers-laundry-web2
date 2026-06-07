'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Rocket, Star, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 20 - 10,
      y: (e.clientY / window.innerHeight) * 20 - 10,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  const handleGoHome = () => router.push('/');

  const handleGoBack = () => router.back();

  return (
    <div className='min-h-screen bg-linear-to-br from-blue-500 via-blue-400 to-orange-400 flex items-center justify-center p-4 overflow-hidden relative'>
      {/* Animated Background Blobs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div
          className='absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl'
          style={{
            animation: 'blob 7s infinite',
          }}
        />
        <div
          className='absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl'
          style={{
            animation: 'blob 7s infinite 2s',
          }}
        />
        <div
          className='absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl'
          style={{
            animation: 'blob 7s infinite 4s',
          }}
        />
      </div>

      {/* Main Content */}
      <div className='relative z-10 text-center max-w-4xl mx-auto'>
        {/* 404 Number with Parallax Effect */}
        <div
          className='relative mb-8 will-change-transform'
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <h1
            className='text-[150px] sm:text-[200px] md:text-[300px] font-black text-white/10 leading-none select-none'
            style={{
              animation: 'pulse-slow 3s ease-in-out infinite',
            }}
            aria-hidden='true'
          >
            404
          </h1>
          <div className='absolute inset-0 flex items-center justify-center'>
            <h1
              className='text-[150px] sm:text-[200px] md:text-[300px] font-black bg-linear-to-r from-orange-500 via-yellow-400 to-orange-500 bg-clip-text text-transparent leading-none'
              style={{
                backgroundSize: '200% 200%',
                animation: 'linear-x 3s ease infinite',
              }}
            >
              404
            </h1>
          </div>
        </div>

        {/* Error Message */}
        <div className='space-y-4 mb-8'>
          <h2
            className='text-3xl sm:text-4xl md:text-5xl font-bold text-white'
            style={{
              animation: 'fade-in-up 0.6s ease-out forwards',
            }}
          >
            Oops! Page Not Found
          </h2>
          <p
            className='text-base sm:text-lg md:text-xl text-white/90 max-w-md mx-auto px-4'
            style={{
              animation: 'fade-in-up 0.6s ease-out 0.2s forwards',
              opacity: 0,
            }}
          >
            The page you're looking for seems to have vanished into the digital
            void.
          </p>
        </div>

        {/* Countdown */}
        <div
          className='mb-8'
          style={{
            animation: 'fade-in-up 0.6s ease-out 0.4s forwards',
            opacity: 0,
          }}
        >
          <div className='inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30'>
            <svg
              className='w-5 h-5 text-white'
              fill='none'
              viewBox='0 0 24 24'
              style={{
                animation: 'spin-slow 3s linear infinite',
              }}
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            <span className='text-white font-medium'>
              Redirecting in {countdown}s
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className='flex flex-col sm:flex-row gap-4 justify-center items-center'
          style={{
            animation: 'fade-in-up 0.6s ease-out 0.6s forwards',
            opacity: 0,
          }}
        >
          <button
            onClick={handleGoHome}
            className='group relative px-8 py-4 bg-white text-blue-500 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden flex items-center gap-2'
          >
            <Home className='w-5 h-5 relative z-10' />
            <span className='relative z-10'>Go Home</span>
            <div className='absolute inset-0 bg-linear-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          </button>

          <button
            onClick={handleGoBack}
            className='px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-2'
          >
            <ArrowLeft className='w-5 h-5' />
            Go Back
          </button>
        </div>

        {/* Floating Icons */}
        <div
          className='hidden md:block absolute top-1/2 left-10'
          style={{
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <div className='w-16 h-16 bg-yellow-400/20 backdrop-blur-sm rounded-full flex items-center justify-center'>
            <Search className='w-8 h-8 text-yellow-300' />
          </div>
        </div>
        <div
          className='hidden md:block absolute top-1/3 right-10'
          style={{
            animation: 'float 3s ease-in-out infinite 1s',
          }}
        >
          <div className='w-20 h-20 bg-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center'>
            <Rocket className='w-10 h-10 text-orange-300' />
          </div>
        </div>
        <div
          className='hidden lg:block absolute bottom-1/4 right-20'
          style={{
            animation: 'float 3s ease-in-out infinite 2s',
          }}
        >
          <div className='w-12 h-12 bg-blue-400/20 backdrop-blur-sm rounded-full flex items-center justify-center'>
            <Star className='w-6 h-6 text-blue-200' />
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes linear-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.15;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
