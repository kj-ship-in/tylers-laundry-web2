import type { AuthResponse, CreateAccountValues } from '@/types/auth';
import axios from 'axios';

interface ChangePasswordValues {
  oldPassword: string;
  newPassword: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'https://tylers-laundry-api-ckl4.onrender.com/api/v1';

if (!BASE_URL) {
  throw new Error('API URL is not defined');
}

export const changePasswordService = async ({
  oldPassword,
  newPassword,
}: ChangePasswordValues) => {
  try {
    const res = await axios.post(`${BASE_URL}/auth/change-password`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // or however you store it
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });
    return res;
  } catch (error: any) {
    console.log('Error fetching geocoding data:', JSON.stringify(error));
    throw Error('Failed to fetch geocoding data ', error.message);
  }
};

export const createAccountService = async ({
  name,
  email,
  password,
}: CreateAccountValues): Promise<AuthResponse> => {
  try {
    const res = await axios.post<AuthResponse>(`${BASE_URL}/auth/register`, {
      name,
      email,
      password,
    });

    return res.data;
  } catch (error: any) {
    console.log('Error fetching geocoding data:', JSON.stringify(error));
    throw Error('Failed to fetch geocoding data ', error.message);
  }
};
