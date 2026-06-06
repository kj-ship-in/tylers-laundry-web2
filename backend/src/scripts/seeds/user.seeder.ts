/* eslint-disable no-console */
import { IRole } from '../../models/role.model';
import { User, IUser } from '../../models/user.model';
import { Permission } from '../../types/enums';
import { hashPassword } from '../../utils/hash';

export async function clearUsers(): Promise<void> {
  await User.deleteMany({});
  console.log('  Cleared: users');
}

export async function seedUsers(roles: {
  userRole: IRole;
  staffRole: IRole;
  adminRole: IRole;
}): Promise<{
  admin: IUser;
  staff1: IUser;
  staff2: IUser;
  user1: IUser;
  user2: IUser;
  user3: IUser;
  user4: IUser;
  user5: IUser;
}> {
  const { userRole, staffRole, adminRole } = roles;

  const admin = await User.create({
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

  const staff1 = await User.create({
    name: 'Keoka Johnson',
    email: 'staff@tylers.com',
    password: await hashPassword('Staff123'),
    roleId: staffRole._id,
    phone: '+2202223333',
    address: 'Kololi, The Gambia',
    isVerified: true,
    verifiedAt: new Date('2024-01-05'),
    permissions: [Permission.USER_CREATE, Permission.SERVICE_DELETE],
  });

  const staff2 = await User.create({
    name: 'Lamin Faye',
    email: 'lamin.staff@tylers.com',
    password: await hashPassword('Staff123'),
    roleId: staffRole._id,
    phone: '+2207778889',
    address: 'Serrekunda, The Gambia',
    isVerified: true,
    verifiedAt: new Date('2024-02-10'),
    permissions: [],
  });

  const user1 = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: await hashPassword('Password123'),
    roleId: userRole._id,
    phone: '+2201234567',
    address: 'Bakau, The Gambia',
    isVerified: true,
    verifiedAt: new Date('2024-01-15'),
    permissions: [Permission.TESTIMONIAL_VIEW],
  });

  const user2 = await User.create({
    name: 'Awa Ceesay',
    email: 'awa@example.com',
    password: await hashPassword('Password123'),
    roleId: userRole._id,
    phone: '+2205556666',
    address: 'Brikama, The Gambia',
    isVerified: true,
    verifiedAt: new Date('2024-02-20'),
    permissions: [],
  });

  const user3 = await User.create({
    name: 'Ousman Jallow',
    email: 'ousman@example.com',
    password: await hashPassword('Password123'),
    roleId: userRole._id,
    phone: '+2204441122',
    address: 'Kanifing, The Gambia',
    isVerified: true,
    verifiedAt: new Date('2024-03-01'),
    permissions: [],
  });

  const user4 = await User.create({
    name: 'Fatou Bojang',
    email: 'fatou@example.com',
    password: await hashPassword('Password123'),
    roleId: userRole._id,
    phone: '+2203334455',
    address: 'Fajara, The Gambia',
    isVerified: false,
    permissions: [],
  });

  const user5 = await User.create({
    name: 'Samba Touray',
    email: 'samba@example.com',
    password: await hashPassword('Password123'),
    roleId: userRole._id,
    phone: '+2206667788',
    address: 'Bundung, The Gambia',
    isVerified: true,
    verifiedAt: new Date('2024-04-12'),
    permissions: [],
  });

  console.log('  Seeded: users (1 admin, 2 staff, 5 customers)');
  return { admin, staff1, staff2, user1, user2, user3, user4, user5 };
}
