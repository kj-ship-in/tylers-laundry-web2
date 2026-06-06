'use client';

import type { ReactNode } from 'react';
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

interface SessionProviderProps {
  children: ReactNode;
  session: Session | null;
}

export const SessionProvider = ({
  children,
  session,
}: Readonly<SessionProviderProps>) => {
  return (
    <NextAuthSessionProvider
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus // Refetch when window gains focus
      refetchWhenOffline={false} // Don't refetch when offline
    >
      {children}
    </NextAuthSessionProvider>
  );
};
