'use client';

import { appImages } from '@/constants/app-images';
import Image from 'next/image';
import React from 'react';

const LaundryImage = () => {
  return (
    <div className='aspect-square rounded-2xl overflow-hidden relative'>
      <Image
        src={appImages.servicesImage}
        alt='Professional laundry service - woman folding clean clothes'
        fill
        className='object-fill rounded-2xl'
        sizes='(max-width: 768px) 100vw, 50vw'
        priority
      />

      <p className='absolute bottom-4 left-4 bg-gray-100 px-4 py-2 rounded-full font-medium text-lg'>
        Your clothes in good hands
      </p>
    </div>
  );
};

export default LaundryImage;
