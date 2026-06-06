import type { User } from './user';

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface CreateAccountValues {
  name: string;
  email: string;
  password: string;
}
