import axios from 'axios';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://tylers-laundry-api-ckl4.onrender.com/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 },
      );
    }

    const response = await axios.post(`${BASE_URL}/auth/verify-email`, {
      email,
      code,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(
        { error: error.response.data?.message ?? 'Verification failed' },
        { status: error.response.status },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
