'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { RoleManager } from '@/utils/api-client';

export function AuthInitializer() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      const user = session.user as any;
      RoleManager.setUserInfo({
        id: user.id,
        role: user.role,
        permissions: user.permissions ?? [],
      });
    } else {
      RoleManager.clearUserInfo();
    }
  }, [session, status]);

  return null; // This component doesn't render anything
}
