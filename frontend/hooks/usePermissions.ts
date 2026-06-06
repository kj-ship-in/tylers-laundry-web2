import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import type { Permission } from '@/types/permission';
import type { UserRole } from '@/utils/api-client';
import { RoleManager } from '@/utils/api-client';

/**
 * Custom hook for permission checking in React components
 * Provides convenient methods to check user permissions and roles
 */
export function usePermissions() {
  const { data: session } = useSession();

  // Update RoleManager with session data
  useMemo(() => {
    if (session?.user) {
      // Hardcode permissions for testing
      const hardcodedPermissions = [
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
      ];

      console.log('🔑 usePermissions - Using hardcoded permissions:', {
        id: session.user.id,
        role: session.user.role,
        permissions: hardcodedPermissions,
        permissionsLength: hardcodedPermissions.length,
      });

      // Check specifically for ROLE_VIEW permission
      const hasRoleView = hardcodedPermissions.includes('role:view');
      console.log('🔑 usePermissions - Checking for role:view permission:', {
        permissionsArray: hardcodedPermissions,
        hasRoleView,
        roleIsAdmin: session.user.role === 'ADMIN',
      });

      RoleManager.setUserInfo({
        id: Number(session.user.id),
        role: session.user.role as UserRole,
        permissions: hardcodedPermissions as Permission[],
      });
    } else {
      console.log('🔑 usePermissions - No session user, clearing info');
      RoleManager.clearUserInfo();
    }
  }, [session]);

  return {
    // Role checking
    isAdmin: RoleManager.isAdmin(),
    isStaff: RoleManager.isStaff(),
    isUser: RoleManager.isUser(),
    hasRole: (role: UserRole) => RoleManager.hasRole(role),
    hasAnyRole: (roles: UserRole[]) => RoleManager.hasAnyRole(roles),
    hasRoleLevel: (role: UserRole) => RoleManager.hasRoleLevel(role),

    // Permission checking
    hasPermission: (permission: string) =>
      RoleManager.hasPermission(permission as Permission),
    hasAnyPermission: (permissions: string[]) =>
      RoleManager.hasAnyPermission(permissions as Permission[]),
    hasAllPermissions: (permissions: string[]) =>
      RoleManager.hasAllPermissions(permissions as Permission[]),

    // Access level checking
    canAccessAdmin: RoleManager.canAccessAdmin(),
    canAccessStaff: RoleManager.canAccessStaff(),

    // Current user info
    currentRole: RoleManager.getCurrentRole(),
    currentUserId: RoleManager.getCurrentUserId(),
    currentPermissions: RoleManager.getCurrentPermissions(),
  };
}

/**
 * Hook for checking specific permissions with memoization
 * Useful for conditional rendering based on permissions
 */
export function useHasPermission(permission: string) {
  const { hasPermission } = usePermissions();
  return useMemo(() => hasPermission(permission), [hasPermission, permission]);
}

/**
 * Hook for checking if user has any of the specified permissions
 */
export function useHasAnyPermission(permissions: string[]) {
  const { hasAnyPermission } = usePermissions();
  return useMemo(
    () => hasAnyPermission(permissions),
    [hasAnyPermission, permissions],
  );
}

/**
 * Hook for checking if user has all of the specified permissions
 */
export function useHasAllPermissions(permissions: string[]) {
  const { hasAllPermissions } = usePermissions();
  return useMemo(
    () => hasAllPermissions(permissions),
    [hasAllPermissions, permissions],
  );
}
