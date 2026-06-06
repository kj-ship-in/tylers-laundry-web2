/* eslint-disable no-console */
import { Role, IRole } from '../../models/role.model';
import { Permission } from '../../types/enums';

export async function clearRoles(): Promise<void> {
  await Role.deleteMany({});
  console.log('  Cleared: roles');
}

export async function seedRoles(): Promise<{
  userRole: IRole;
  staffRole: IRole;
  adminRole: IRole;
}> {
  const userRole = await Role.create({
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
  });

  const staffRole = await Role.create({
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
  });

  const adminRole = await Role.create({
    name: 'ADMIN',
    description: 'Administrator with full system access',
    permissions: Object.values(Permission),
    isSystem: true,
    isActive: true,
  });

  console.log('  Seeded: roles (USER, STAFF, ADMIN)');
  return { userRole, staffRole, adminRole };
}
