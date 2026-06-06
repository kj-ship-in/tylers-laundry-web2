import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import axios from 'axios';
import { authOptions } from '../[...nextauth]/route';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://tylers-laundry-api-ckl4.onrender.com/api/v1';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 },
      );
    }

    // Call backend API to verify email
    const response = await axios.post(
      `${BASE_URL}/auth/verify-email`,
      { token },
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Email verification error:', error);

    if (error.response) {
      // Backend returned an error
      return NextResponse.json(
        { error: error.response.data?.message ?? 'Verification failed' },
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
