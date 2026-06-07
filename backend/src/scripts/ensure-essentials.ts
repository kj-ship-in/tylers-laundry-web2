/* eslint-disable no-console */
import { Role } from '../models/role.model';
import { Service } from '../models/service.model';
import { Testimonial } from '../models/testimonial.model';
import { User } from '../models/user.model';
import { Permission } from '../types/enums';
import { hashPassword } from '../utils/hash';

async function ensureRoles(): Promise<void> {
  const existing = await Role.countDocuments({});
  if (existing > 0) return;

  await Role.create([
    {
      name: 'USER',
      description: 'Regular user with basic access',
      permissions: [
        Permission.PROFILE_VIEW_OWN,
        Permission.PROFILE_UPDATE_OWN,
        Permission.BOOKING_VIEW_OWN,
        Permission.BOOKING_CREATE,
        Permission.PAYMENT_VIEW_OWN,
        Permission.INVOICE_VIEW_OWN,
        Permission.RECEIPT_VIEW_OWN,
        Permission.TESTIMONIAL_CREATE,
        Permission.TESTIMONIAL_VIEW,
        Permission.TESTIMONIAL_UPDATE,
        Permission.SERVICE_VIEW,
      ],
      isSystem: true,
      isActive: true,
    },
    {
      name: 'STAFF',
      description: 'Staff member with operational access',
      permissions: [
        Permission.PROFILE_VIEW_OWN,
        Permission.PROFILE_UPDATE_OWN,
        Permission.BOOKING_VIEW_ALL,
        Permission.BOOKING_UPDATE_STATUS,
        Permission.BOOKING_CREATE_FOR_CLIENT,
        Permission.USER_VIEW,
        Permission.SERVICE_VIEW,
        Permission.SERVICE_UPDATE,
        Permission.PAYMENT_VIEW_ALL,
        Permission.PAYMENT_PROCESS,
        Permission.INVOICE_VIEW_ALL,
        Permission.INVOICE_CREATE,
        Permission.INVOICE_GENERATE,
        Permission.RECEIPT_VIEW_ALL,
        Permission.RECEIPT_CREATE,
        Permission.RECEIPT_GENERATE,
        Permission.ANALYTICS_VIEW,
        Permission.REPORTS_VIEW,
        Permission.PDF_GENERATE_INVOICE,
        Permission.PDF_GENERATE_RECEIPT,
        Permission.TESTIMONIAL_VIEW,
        Permission.TESTIMONIAL_MANAGE,
        Permission.STAFF_VIEW,
      ],
      isSystem: true,
      isActive: true,
    },
    {
      name: 'ADMIN',
      description: 'Administrator with full system access',
      permissions: Object.values(Permission),
      isSystem: true,
      isActive: true,
    },
  ]);

  console.log('Seeded: roles (USER, STAFF, ADMIN)');
}

async function ensureAdminUser(): Promise<void> {
  const adminRole = await Role.findOne({ name: 'ADMIN', isActive: true });
  if (!adminRole) return;

  const existing = await User.findOne({ email: 'admin@tylers.com' });
  if (existing) return;

  await User.create({
    name: 'Kiera Johnson',
    email: 'admin@tylers.com',
    password: await hashPassword('Admin123'),
    roleId: adminRole._id,
    phone: '+2209876543',
    address: 'Kololi, The Gambia',
    isVerified: true,
    verifiedAt: new Date('2024-01-01'),
    permissions: [Permission.SETTINGS_UPDATE, Permission.PERMISSION_ASSIGN],
  });

  console.log('Seeded: admin user (admin@tylers.com)');
}

async function ensureServices(): Promise<void> {
  const existing = await Service.countDocuments({});
  if (existing > 0) return;

  await Service.create([
    {
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
    },
    {
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
    },
    {
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
    },
    {
      title: 'Wash & Iron',
      type: 'wash-iron',
      price: 200.0,
      description:
        'Complete wash and iron combo — clean, pressed, ready to wear',
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
    },
    {
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
    },
  ]);

  console.log(
    'Seeded: services (Wash & Fold, Dry Cleaning, Ironing, Wash & Iron, Premium Care)',
  );
}

async function ensureTestimonials(): Promise<void> {
  const existing = await Testimonial.countDocuments({});
  if (existing > 0) return;

  const admin = await User.findOne({ email: 'admin@tylers.com' });
  if (!admin) return;

  await Testimonial.insertMany([
    {
      userId: admin._id,
      rating: 5,
      title: 'Excellent Service!',
      content:
        "Tyler's Laundry has been a lifesaver! Their wash and fold service is incredibly convenient, and my clothes always come back clean and neatly folded. Highly recommend!",
      isApproved: true,
      isActive: true,
    },
    {
      userId: admin._id,
      rating: 5,
      title: 'Best Dry Cleaning in Town',
      content:
        "I trust Tyler's with all my delicate fabrics. Their dry cleaning service is top-notch, and they always handle my clothes with care. The staff is professional and friendly.",
      isApproved: true,
      isActive: true,
    },
    {
      userId: admin._id,
      rating: 5,
      title: 'Premium Care Is Worth Every Penny',
      content:
        'I brought in my silk blouses and was blown away by the results. Every garment came back looking brand new. The attention to detail is outstanding.',
      isApproved: true,
      isActive: true,
    },
    {
      userId: admin._id,
      rating: 4,
      title: 'Quick and Reliable',
      content:
        'Great ironing service! They turned my wrinkled shirts into crisp, professional-looking garments in no time. Very satisfied with the quality.',
      isApproved: true,
      isActive: true,
    },
    {
      userId: admin._id,
      rating: 4,
      title: 'Convenient Pickup and Delivery',
      content:
        'Love that they come right to my door. The wash and iron package is my go-to for work clothes every week. Consistent quality every time.',
      isApproved: true,
      isActive: true,
    },
    {
      userId: admin._id,
      rating: 5,
      title: 'My Favourite Laundry Service',
      content:
        "I've tried a few places in the area but Tyler's is by far the best. Friendly staff, fast turnaround, and clothes always smell fresh. Will keep coming back!",
      isApproved: true,
      isActive: true,
    },
  ]);

  console.log('Seeded: testimonials (6 records)');
}

export async function ensureEssentials(): Promise<void> {
  await ensureRoles();
  await ensureAdminUser();
  await ensureServices();
  await ensureTestimonials();
}
