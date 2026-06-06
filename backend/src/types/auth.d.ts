export interface AuthInput {
    email: string;
    password: string;
}

export interface UserCreateInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
}

export interface TokenPayload {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface EmailVerification {
  id: string;
  userId: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface RequestVerificationRequest {
  email: string;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface PasswordResetRequest {
  email: string;
  newPassword: string;
  resetToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserProfile;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: string;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  permissions: string[];
  phone?: string;
  address?: string;
  profileUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  profileUrl?: string;
}

export interface CreatePinRequest {
  pin: string;
  confirmPin: string;
}

export interface ChangePinRequest {
  oldPin: string;
  newPin: string;
}

export interface EnableBiometricsRequest {
  enabled: boolean;
}
