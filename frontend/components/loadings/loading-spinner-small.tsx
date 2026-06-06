'use client';

import React, { type FC } from 'react';

import { motion } from 'framer-motion';

type LoadingSpinnerProps = {
  size?: string;
};

const LoadingSpinnerSmall: FC<LoadingSpinnerProps> = ({
  size = 'w-24 h-24',
}) => {
  return (
    <motion.div
      className={`relative ${size}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
    >
      {[...Array(4)].map((_, index) => (
        <motion.span
          key={index + 1}
          className='absolute w-full h-full border-2 rounded-full animate-spin'
          style={{
            borderColor: `${index % 2 === 0 ? '#16a34a' : '#2563eb'} transparent transparent transparent`,
            animationDuration: '1.5s',
            animationDelay: `${-0.45 * index}s`,
          }}
        />
      ))}
    </motion.div>
  );
};

export default LoadingSpinnerSmall;
