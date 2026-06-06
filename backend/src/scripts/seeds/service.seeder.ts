/* eslint-disable no-console */
import { Service, IService } from '../../models/service.model';

export async function clearServices(): Promise<void> {
  await Service.deleteMany({});
  console.log('  Cleared: services');
}

export async function seedServices(): Promise<{
  washFold: IService;
  dryCleaning: IService;
  ironing: IService;
  washIron: IService;
  premiumCare: IService;
}> {
  const washFold = await Service.create({
    title: 'Wash & Fold',
    type: 'wash-fold',
    price: 150.0,
    description:
      'Professional washing and folding service for everyday laundry',
    features: [
      'Same-day service available',
      'Eco-friendly detergents',
      'Sorted by preference',
    ],
    turnaround: '24-48 hours',
    includes: [
      'Washing',
      'Drying',
      'Folding',
      'Sorting by color',
      'Fabric softener',
    ],
    ideal: 'Everyday wear, casual clothing, bed linens',
    estimatedTime: '24-48 hours',
    isActive: true,
  });

  const dryCleaning = await Service.create({
    title: 'Dry Cleaning',
    type: 'dry-clean',
    price: 250.0,
    description: 'Professional dry cleaning for delicate and formal fabrics',
    features: [
      'Expert stain removal',
      'Gentle on fabrics',
      'Professional pressing',
    ],
    turnaround: '48-72 hours',
    includes: [
      'Dry cleaning',
      'Stain treatment',
      'Professional pressing',
      'Hanger packaging',
      'Fabric protection',
    ],
    ideal: 'Suits, dresses, delicate fabrics, formal wear',
    estimatedTime: '48-72 hours',
    isActive: true,
  });

  const ironing = await Service.create({
    title: 'Ironing Service',
    type: 'ironing',
    price: 80.0,
    description: 'Professional ironing and pressing service',
    features: ['Quick turnaround', 'Crisp finishing', 'Careful handling'],
    turnaround: '12-24 hours',
    includes: [
      'Professional ironing',
      'Neat folding',
      'Hanging option',
      'Wrinkle-free guarantee',
    ],
    ideal: 'Shirts, pants, everyday clothing',
    estimatedTime: '12-24 hours',
    isActive: true,
  });

  const washIron = await Service.create({
    title: 'Wash & Iron',
    type: 'wash-iron',
    price: 200.0,
    description: 'Complete wash and iron combo — clean, pressed, ready to wear',
    features: ['All-in-one service', 'Time-saving', 'Professional finish'],
    turnaround: '24-48 hours',
    includes: [
      'Washing',
      'Drying',
      'Professional ironing',
      'Folding or hanging',
      'Quality detergent',
    ],
    ideal: 'Business attire, formal wear, everyday clothes',
    estimatedTime: '24-48 hours',
    isActive: true,
  });

  const premiumCare = await Service.create({
    title: 'Premium Care',
    type: 'premium-care',
    price: 400.0,
    description: 'White-glove treatment for luxury and delicate garments',
    features: [
      'Hand-washing available',
      'Individual garment attention',
      'Fragrance-free options',
      'Padded packaging',
    ],
    turnaround: '72-96 hours',
    includes: [
      'Hand or machine wash',
      'Specialist stain removal',
      'Flat-drying for knitwear',
      'Steam pressing',
      'Garment bag return',
    ],
    ideal: 'Cashmere, silk, linen, embroidered or embellished pieces',
    estimatedTime: '72-96 hours',
    isActive: true,
  });

  console.log(
    '  Seeded: services (Wash & Fold, Dry Cleaning, Ironing, Wash & Iron, Premium Care)',
  );
  return { washFold, dryCleaning, ironing, washIron, premiumCare };
}
