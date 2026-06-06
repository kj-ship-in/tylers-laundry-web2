import type { User } from './types/user';
import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      permissions?: string[];
      isActive?: boolean;
      isVerified?: boolean;
      profileUrl?: string;
      createdAt?: string;
      updatedAt?: string;
    } & DefaultSession['user'];
    accessToken: string;
    refreshToken?: string;
  }

  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role?: 'USER' | 'STAFF' | 'ADMIN' | string;
    permissions: string[];
    profileUrl?: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken?: string;
    role?: string;
    permissions?: string[];
    isActive?: boolean;
    isVerified?: boolean;
    profileUrl?: string;
    createdAt?: string;
    updatedAt?: string;
  }
}
