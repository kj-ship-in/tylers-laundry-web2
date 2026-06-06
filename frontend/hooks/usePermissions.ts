import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import type { Permission } from '@/types/permission';
import type { UserRole } from '@/utils/api-client';
import { RoleManager } from '@/utils/api-client';

const PERMISSIONS_BY_ROLE: Record<string, string[]> = {
  USER: [
    'profile:view:own',
    'profile:update:own',
    'booking:view:own',
    'booking:create',
    'service:view',
    'testimonial:create',
    'payment:view:own',
    'invoice:view:own',
    'receipt:view:own',
  ],
  STAFF: [
    'profile:view:own',
    'profile:update:own',
    'booking:view:all',
    'booking:update:status',
    'user:view',
    'service:view',
    'service:update',
    'analytics:view',
    'reports:view',
    'staff:view',
    'pdf:generate:invoice',
    'pdf:generate:receipt',
  ],
  ADMIN: [
    'user:view',
    'user:create',
    'user:update',
    'user:delete',
    'user:confirm:staff',
    'profile:view:own',
    'profile:update:own',
    'booking:view:own',
    'booking:view:all',
    'booking:create',
    'booking:create:for:client',
    'booking:update',
    'booking:update:status',
    'booking:delete',
    'service:view',
    'service:create',
    'service:update',
    'service:delete',
    'payment:view:own',
    'payment:view:all',
    'payment:create',
    'payment:update',
    'payment:delete',
    'payment:process',
    'invoice:view:own',
    'invoice:view:all',
    'invoice:create',
    'invoice:update',
    'invoice:delete',
    'invoice:generate',
    'receipt:view:own',
    'receipt:view:all',
    'receipt:create',
    'receipt:update',
    'receipt:delete',
    'receipt:generate',
    'testimonial:view',
    'testimonial:create',
    'testimonial:update',
    'testimonial:delete',
    'testimonial:manage',
    'analytics:view',
    'reports:view',
    'reports:generate',
    'reports:export',
    'pdf:generate:invoice',
    'pdf:generate:receipt',
    'pdf:generate:report',
    'settings:update',
    'staff:manage',
    'staff:view',
    'staff:create',
    'staff:update',
    'staff:delete',
    'role:view',
    'role:create',
    'role:update',
    'role:delete',
    'permission:assign',
  ],
};

export function usePermissions() {
  const { data: session } = useSession();

  useMemo(() => {
    if (session?.user) {
      const role = session.user.role ?? 'USER';
      const permissions = session.user.permissions?.length
        ? session.user.permissions
        : (PERMISSIONS_BY_ROLE[role] ?? PERMISSIONS_BY_ROLE.USER);

      RoleManager.setUserInfo({
        id: String(session.user.id),
        role: role as UserRole,
        permissions: permissions as Permission[],
      });
    } else {
      RoleManager.clearUserInfo();
    }
  }, [session]);

  return {
    isAdmin: RoleManager.isAdmin(),
    isStaff: RoleManager.isStaff(),
    isUser: RoleManager.isUser(),
    hasRole: (role: UserRole) => RoleManager.hasRole(role),
    hasAnyRole: (roles: UserRole[]) => RoleManager.hasAnyRole(roles),
    hasRoleLevel: (role: UserRole) => RoleManager.hasRoleLevel(role),
    hasPermission: (permission: string) =>
      RoleManager.hasPermission(permission as Permission),
    hasAnyPermission: (permissions: string[]) =>
      RoleManager.hasAnyPermission(permissions as Permission[]),
    hasAllPermissions: (permissions: string[]) =>
      RoleManager.hasAllPermissions(permissions as Permission[]),
    canAccessAdmin: RoleManager.canAccessAdmin(),
    canAccessStaff: RoleManager.canAccessStaff(),
    currentRole: RoleManager.getCurrentRole(),
    currentUserId: RoleManager.getCurrentUserId(),
    currentPermissions: RoleManager.getCurrentPermissions(),
  };
}

export function useHasPermission(permission: string) {
  const { hasPermission } = usePermissions();
  return useMemo(() => hasPermission(permission), [hasPermission, permission]);
}

export function useHasAnyPermission(permissions: string[]) {
  const { hasAnyPermission } = usePermissions();
  return useMemo(
    () => hasAnyPermission(permissions),
    [hasAnyPermission, permissions],
  );
}

export function useHasAllPermissions(permissions: string[]) {
  const { hasAllPermissions } = usePermissions();
  return useMemo(
    () => hasAllPermissions(permissions),
    [hasAllPermissions, permissions],
  );
}
