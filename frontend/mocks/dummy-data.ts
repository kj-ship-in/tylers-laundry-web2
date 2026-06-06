import BoxIcon from '@/components/svgs/BoxIcon';
import CalendarCheckIcon from '@/components/svgs/CalendarCheckIcon';
import DeliveryIcon from '@/components/svgs/DeliveryIcon';
import SparkleIcon from '@/components/svgs/SparkleIcon';
import { appImages } from '@/constants/app-images';
import type { Testimonial } from '@/types/testimonials';
import { Shield, Zap, Heart, TrendingUp, Calendar } from 'lucide-react';

export const services = [
  {
    title: 'Wash & Fold',
    price: 'From GMD 15',
    description: 'Professional washing and folding service',
    features: [
      'Same-day service',
      'Eco-friendly detergents',
      'Sorted by preference',
    ],
    details: {
      turnaround: '24-48 hours',
      includes: [
        'Washing',
        'Drying',
        'Folding',
        'Sorting by color',
        'Fabric softener',
      ],
      ideal: 'Everyday wear, casual clothing, bed linens',
    },
  },
  {
    title: 'Dry Cleaning',
    price: 'From GMD 25',
    description: 'Expert dry cleaning for delicate items',
    features: ['Stain removal', 'Professional pressing', 'Garment inspection'],
    details: {
      turnaround: '2-3 business days',
      includes: [
        'Deep cleaning',
        'Stain treatment',
        'Professional pressing',
        'Quality inspection',
        'Protective covering',
      ],
      ideal: 'Suits, dresses, silk, wool, delicate fabrics',
    },
  },
  {
    title: 'Ironing Service',
    price: 'From GMD 10',
    description: 'Crisp and professional ironing',
    features: ['Steam pressing', 'Crease perfection', 'Hanger service'],
    details: {
      turnaround: '24 hours',
      includes: [
        'Steam pressing',
        'Collar & cuff attention',
        'Hanger delivery',
        'Wrinkle removal',
        'Professional finish',
      ],
      ideal: 'Shirts, blouses, pants, formal wear',
    },
  },
];

export const steps = [
  {
    icon: CalendarCheckIcon,
    title: 'Book Online',
    desc: 'Schedule a pickup time that works for you',
  },
  {
    icon: BoxIcon,
    title: 'We Collect',
    desc: 'Our team picks up your laundry from your doorstep',
  },
  {
    icon: SparkleIcon,
    title: 'We Clean',
    desc: 'Professional cleaning with premium care',
  },
  {
    icon: DeliveryIcon,
    title: 'We Deliver',
    desc: 'Fresh, clean clothes delivered back to you',
  },
];

export const items = [
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    desc: 'Satisfaction guaranteed or your money back',
  },
  {
    icon: Zap,
    title: 'Fast Service',
    desc: 'Same-day and express options available',
  },
  {
    icon: Heart,
    title: 'Careful Handling',
    desc: 'Each garment treated with special care',
  },
  {
    icon: TrendingUp,
    title: 'Best Prices',
    desc: 'Competitive rates with no hidden fees',
  },
];

export const serviceImage = (title: string) => {
  switch (title) {
    case 'wash-fold':
      return appImages.washFoldImage;
    case 'dry-clean':
      return appImages.dryCleanImage;
    case 'ironing':
      return appImages.ironImage;
    case 'wash-iron':
      return appImages.washIronImage;
    default:
      return appImages.laundryImage;
  }
};

export const dummyBookings = [
  {
    id: 1,
    userId: '1', // string to match session.user.id
    serviceId: 1,
    pickupAddress: '123 Main St',
    deliveryAddress: '123 Main St',
    pickupDate: '2025-12-25T10:00:00Z',
    status: 'COMPLETED',
    totalAmount: 45,
    deliveryFee: 5,
    note: 'Handle with care',
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2025-12-22T10:00:00Z',
    service: {
      id: 1,
      title: 'Wash & Fold',
      price: 15,
    },
  },
  {
    id: 2,
    userId: '1',
    serviceId: 2,
    pickupAddress: '456 Oak Ave',
    deliveryAddress: '456 Oak Ave',
    pickupDate: '2025-12-30T14:00:00Z',
    status: 'PENDING',
    totalAmount: 60,
    deliveryFee: 5,
    note: null,
    createdAt: '2025-12-28T10:00:00Z',
    updatedAt: '2025-12-28T10:00:00Z',
    service: {
      id: 2,
      title: 'Dry Cleaning',
      price: 25,
    },
  },
  {
    id: 3,
    userId: '1',
    serviceId: 1,
    pickupAddress: '789 Pine Rd',
    deliveryAddress: '789 Pine Rd',
    pickupDate: '2025-12-15T09:00:00Z',
    status: 'COMPLETED',
    totalAmount: 30,
    deliveryFee: 5,
    note: 'Express service',
    createdAt: '2025-12-10T10:00:00Z',
    updatedAt: '2025-12-16T10:00:00Z',
    service: {
      id: 1,
      title: 'Wash & Fold',
      price: 15,
    },
  },
  {
    id: 4,
    userId: '2',
    serviceId: 3,
    pickupAddress: '321 Elm St',
    deliveryAddress: '321 Elm St',
    pickupDate: '2025-12-31T11:00:00Z',
    status: 'CONFIRMED',
    totalAmount: 40,
    deliveryFee: 5,
    note: null,
    createdAt: '2025-12-29T10:00:00Z',
    updatedAt: '2025-12-29T10:00:00Z',
    service: {
      id: 3,
      title: 'Ironing Service',
      price: 10,
    },
  },
];
