'use client';
/* eslint-disable react/no-unknown-property */

import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className='bg-transparent flex items-center justify-center h-screen'>
      <motion.div
        className='relative w-24 h-24'
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        {[...Array(4)].map((_, index) => (
          <motion.span
            key={index + 1}
            className='absolute w-full h-full border-4 rounded-full'
            style={{
              borderColor: `${index % 2 === 0 ? '#fb7185' : '#22d3ee'} transparent transparent transparent`,
              animation: `spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite ${-0.45 * index}s`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          />
        ))}
      </motion.div>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
