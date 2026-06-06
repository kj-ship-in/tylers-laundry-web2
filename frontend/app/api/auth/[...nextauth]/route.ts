import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

import type { AuthResponse } from '@/types/auth';
import { parseExpiresIn } from '@/utils/helpers';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

if (!BASE_URL) {
  throw new Error('API URL is not defined');
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          console.error('No credentials provided');
          return null;
        }

        try {
          console.log('Attempting login with email:', credentials.email);
          console.log('API URL:', BASE_URL);

          // Call your backend API
          const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password,
          });

          const response = res.data;

          // Handle nested data structure: { success, message, data: { user, accessToken, refreshToken, expiresIn } }
          const data = response.data ?? response;
          const user = data.user ?? data;
          const accessToken = data.accessToken;
          const refreshToken = data.refreshToken;
          const expiresIn = data.expiresIn ?? '15m';

          // Check if we have required fields (backend returns id, not _id)
          const userId = user?._id ?? user?.id;
          if (userId && accessToken) {
            console.log('Login successful for user:', user.email);
            return {
              id: userId.toString(),
              name: user.name,
              email: user.email,
              accessToken: accessToken,
              refreshToken: refreshToken,
              expiresIn: expiresIn,
              role: user.role,
              permissions: user.permissions ?? [],
              isActive: user.isActive ?? true,
              isVerified: user.isVerified ?? true,
              profileUrl: user.profileUrl,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            };
          }

          console.error('Invalid response structure:', response);
          return null;
        } catch (e) {
          const error = e as any;
          console.error('Auth error:', error.message);
          if (error.response?.data) {
            console.error('Backend error response:', error.response.data);
          }
          if (error.response?.status === 401) {
            console.error('Invalid credentials - 401 Unauthorized');
          }

          // Return error message from backend if available
          if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
          }

          throw new Error('Login failed. Please check your credentials.');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial login, store user data in token
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresIn = user.expiresIn;
        token.role = user.role;
        token.permissions = user.permissions;
        token.isActive = user.isActive;
        token.isVerified = user.isVerified;
        token.profileUrl = user.profileUrl;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      }

      // Check if token is expired and refresh if needed
      if (token.expiresIn && token.refreshToken) {
        // Calculate time until expiry from the expiresIn string
        const expiresInMs = parseExpiresIn(token.expiresIn as string);
        const loginTime = (token.iat as number) * 1000 || Date.now();
        const expiresAt = new Date(loginTime + expiresInMs);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();

        // Refresh token if it expires within 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000) {
          try {
            const refreshResponse = await axios.post(
              `${BASE_URL}/auth/refresh-token`,
              {
                refreshToken: token.refreshToken,
              },
            );

            const refreshData = refreshResponse.data;

            // Update token with new access token and expiration
            token.accessToken = refreshData.accessToken;
            token.expiresIn = refreshData.expiresIn ?? '15m';

            // Update refresh token if provided
            if (refreshData.refreshToken) {
              token.refreshToken = refreshData.refreshToken;
            }

            // Reset the issued at time to now for the new token
            token.iat = Math.floor(Date.now() / 1000);
          } catch (error) {
            console.error('Token refresh failed:', error);
            // Token refresh failed, but don't throw error here
            // The session will be invalidated on the next request
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.profileUrl as string;
      }

      // Add custom properties to session
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken as string;

      // Add role and permissions to session
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).address = token.address;
        (session.user as any).permissions = token.permissions;
        (session.user as any).isActive = token.isActive;
        (session.user as any).isVerified = token.isVerified;
        (session.user as any).profileUrl = token.profileUrl;
        (session.user as any).createdAt = token.createdAt;
        (session.user as any).updatedAt = token.updatedAt;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret:
    process.env.NEXTAUTH_SECRET ??
    'nRVEjSaxzqiSEN+HE6OEUrmbUw5qr2fzOTMivretWsg=',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
