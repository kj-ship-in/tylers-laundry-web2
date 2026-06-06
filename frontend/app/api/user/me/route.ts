import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import apiClient from '@/utils/api-client';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use API client to get current user info
    const response = await apiClient.get('/user/me');

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Get current user error:', error);

    if (error.response) {
      // Backend returned an error
      return NextResponse.json(
        { error: error.response.data?.message ?? 'Failed to get user info' },
        { status: error.response.status },
      );
    }

    // Network or other error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
