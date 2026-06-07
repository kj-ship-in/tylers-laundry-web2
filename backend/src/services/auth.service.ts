/* eslint-disable @typescript-eslint/no-explicit-any */

import { EmailVerification } from '../models/email-verification.model';
import { PasswordResetToken } from '../models/password-reset-token.model';
import { Role } from '../models/role.model';
import { Session } from '../models/session.model';
import { User } from '../models/user.model';
import {
  ConflictError,
  AuthenticationError,
} from '../middlewares/error.middleware';
import { UserCreateInput, AuthResponse, UserProfile } from '../types/auth';
import { hashPassword } from '../utils/hash';
import { getRelativeExpiry } from '../utils/helper';
import { generateRefreshToken, generateToken } from '../utils/jwt';
import { generateResetToken } from '../utils/token-generator';
import { generateVerificationCode } from '../utils/verification-code-generator';

import { sendEmail } from './email.service';
import { getPermissionsAsStrings } from './permission.service';

const CODE_EXPIRATION_MINUTES = 14;

export const registerUserService = async (
  data: UserCreateInput,
): Promise<AuthResponse> => {
  const { name, email, password } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('A user with this email already exists');
  }

  const hashed = await hashPassword(password);

  const userRole = await Role.findOne({ name: 'USER', isActive: true });
  if (!userRole) {
    throw new Error('Default USER role not found. Please run database seeding.');
  }

  const user = await User.create({
    name,
    email,
    password: hashed,
    roleId: userRole._id,
    isVerified: false,
  });

  const populatedUser = await User.findById(user._id).populate('roleId');

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000);

  await EmailVerification.findOneAndUpdate(
    { userId: user._id },
    { userId: user._id, code, expiresAt, createdAt: new Date() },
    { upsert: true, new: true },
  );

  const expiryTime = getRelativeExpiry(expiresAt);

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your Verification Code',
      text: 'verification code',
      code,
      expiresAt: expiryTime,
    });
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
  }

  const role = (populatedUser?.roleId as any)?.name ?? 'USER';
  const userId = (user._id as any).toString();

  const accessToken = generateToken({ id: userId, name: user.name, email: user.email, role });
  const refreshToken = generateRefreshToken({ id: userId, name: user.name, email: user.email, role });

  await Session.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true },
  );

  const userProfile: UserProfile = {
    id: userId,
    name: user.name,
    email: user.email,
    role,
    roleId: userRole._id.toString(),
    permissions: await getPermissionsAsStrings(userId),
    phone: user.phone,
    address: user.address,
    profileUrl: user.profileUrl,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  return {
    success: true,
    message: 'Customer registered successfully. Verification code sent to email.',
    data: { user: userProfile, accessToken, refreshToken, expiresIn: '15m' },
  };
};

export const registerPrivilegedUserService = async (
  data: UserCreateInput,
  roleName: string,
  requestingUserId: string,
): Promise<AuthResponse> => {
  if (roleName === 'USER') {
    throw new Error('Use registerUserService for users');
  }

  const requestingUser = await User.findById(requestingUserId).populate<{ roleId: { name: string } }>('roleId');
  if (!requestingUser) throw new AuthenticationError('Requesting user not found');

  const requestingRoleName = (requestingUser.roleId as any)?.name;

  if (roleName === 'ADMIN' && requestingRoleName !== 'ADMIN') {
    throw new AuthenticationError('Only admins can create admin accounts');
  }
  if (roleName === 'STAFF' && requestingRoleName !== 'ADMIN') {
    throw new AuthenticationError('Only admins can create staff accounts');
  }

  const { name, email, password } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ConflictError('A user with this email already exists');

  const hashed = await hashPassword(password);

  const targetRole = await Role.findOne({ name: roleName, isActive: true });
  if (!targetRole) throw new Error(`Role ${roleName} not found`);

  const user = await User.create({
    name,
    email,
    password: hashed,
    roleId: targetRole._id,
    isVerified: true,
  });

  const userId = (user._id as any).toString();

  const userProfile: UserProfile = {
    id: userId,
    name: user.name,
    email: user.email,
    role: roleName,
    roleId: targetRole._id.toString(),
    permissions: await getPermissionsAsStrings(userId),
    phone: user.phone,
    address: user.address,
    profileUrl: user.profileUrl,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  const roleLabel = roleName === 'ADMIN' ? 'Admin' : 'Staff';

  return {
    success: true,
    message: `${roleLabel} registered successfully.`,
    data: { user: userProfile },
  };
};

export const registerAdmin = async (
  data: UserCreateInput,
  requestingUserId: string,
): Promise<AuthResponse> => registerPrivilegedUserService(data, 'ADMIN', requestingUserId);

export const registerStaff = async (
  data: UserCreateInput,
  requestingUserId: string,
): Promise<AuthResponse> => registerPrivilegedUserService(data, 'STAFF', requestingUserId);

export const registerUser = async (data: UserCreateInput): Promise<AuthResponse> =>
  registerUserService(data);

export const login = async (userId: string): Promise<AuthResponse> => {
  const user = await User.findByIdAndUpdate(
    userId,
    { lastLogin: new Date() },
    { new: true },
  ).populate<{ roleId: { name: string } }>('roleId');

  if (!user) throw new AuthenticationError('User not found');

  const roleName = (user.roleId as any)?.name ?? 'USER';
  const uid = (user._id as any).toString();

  const token = generateToken({ id: uid, name: user.name, email: user.email, role: roleName });
  const refreshToken = generateRefreshToken({ id: uid, name: user.name, email: user.email, role: roleName });

  await Session.findOneAndUpdate(
    { userId: user._id },
    {
      refreshToken,
      revokedAt: undefined,
      revoked: false,
      expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true },
  );

  return {
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: uid,
        name: user.name,
        email: user.email,
        role: roleName,
        roleId: (user.roleId as any)?._id?.toString() ?? '',
        permissions: await getPermissionsAsStrings(uid),
        phone: user.phone,
        address: user.address,
        profileUrl: user.profileUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accessToken: token,
      refreshToken,
      expiresIn: '15m',
    },
  };
};

export const verifyUserEmail = async (
  userId: string,
  code: string,
): Promise<AuthResponse> => {
  const record = await EmailVerification.findOne({ userId, code });

  if (!record) throw new AuthenticationError('Invalid verification code');
  if (record.expiresAt < new Date()) throw new AuthenticationError('Verification code expired');

  const user = await User.findByIdAndUpdate(
    userId,
    { isVerified: true, verifiedAt: new Date() },
    { new: true },
  ).populate<{ roleId: { name: string } }>('roleId');

  if (!user) throw new AuthenticationError('User not found');

  await EmailVerification.findByIdAndDelete(record._id);

  const roleName = (user.roleId as any)?.name ?? 'USER';
  const uid = (user._id as any).toString();

  const token = generateToken({ id: uid, name: user.name, email: user.email, role: roleName });
  const refreshToken = generateRefreshToken({ id: uid, name: user.name, email: user.email, role: roleName });

  await Session.findOneAndUpdate(
    { userId: user._id },
    {
      refreshToken,
      revokedAt: undefined,
      revoked: false,
      expiresAt: new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true },
  );

  return {
    success: true,
    message: 'Email verified successfully',
    data: {
      user: {
        id: uid,
        name: user.name,
        email: user.email,
        role: roleName,
        roleId: (user.roleId as any)?._id?.toString() ?? '',
        permissions: await getPermissionsAsStrings(uid),
        phone: user.phone,
        address: user.address,
        profileUrl: user.profileUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      accessToken: token,
      refreshToken,
      expiresIn: '15m',
    },
  };
};

export const requestVerificationCode = async (
  userId: string,
  email: string,
): Promise<void> => {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 24 * 60 * 60 * 1000);

  await EmailVerification.findOneAndUpdate(
    { userId },
    { userId, code, expiresAt, createdAt: new Date() },
    { upsert: true, new: true },
  );

  const expiryTime = getRelativeExpiry(expiresAt);
  await sendEmail({ to: email, subject: 'Your Kodoo Verification Code', text: 'verification code', code, expiresAt: expiryTime });
};

export const requestPasswordReset = async (userId: string, email: string): Promise<void> => {
  const resetToken = generateResetToken(6);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await PasswordResetToken.findOneAndUpdate(
    { userId },
    { userId, resetToken, expiresAt },
    { upsert: true, new: true },
  );

  const expiryTime = getRelativeExpiry(expiresAt);
  await sendEmail({ to: email, subject: 'Reset Your Password', text: 'reset token', code: resetToken, expiresAt: expiryTime });
};

export const validateResetToken = async (token: string): Promise<boolean> => {
  const record = await PasswordResetToken.findOne({ resetToken: token, expiresAt: { $gt: new Date() } });
  if (!record) throw new Error('Invalid reset token');
  return !!record.resetToken;
};

export const resetPassword = async (userId: string, newPassword: string): Promise<any> => {
  const storedToken = await PasswordResetToken.findOne({ userId });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new Error('Invalid or expired reset token');
  }

  const hashed = await hashPassword(newPassword);
  await User.findByIdAndUpdate(userId, { password: hashed, passwordUpdatedAt: new Date() });
  await PasswordResetToken.findOneAndDelete({ userId });
};

export const changePassword = async (userId: string, newPassword: string): Promise<void> => {
  const hashed = await hashPassword(newPassword);
  await User.findByIdAndUpdate(userId, { password: hashed, passwordUpdatedAt: new Date() });
};

export const userExists = async (email: string): Promise<boolean> => {
  const user = await User.findOne({ email });
  return !!user;
};

export const findOneByEmail = async (email: string): Promise<any> => {
  return User.findOne({ email }).populate('roleId');
};

export const findOneById = async (userId: string): Promise<any> => {
  return User.findById(userId).populate('roleId');
};

export const logoutService = async (userId: string): Promise<void> => {
  const session = await Session.findOne({ userId });
  if (!session) throw new Error('Session not found');

  const now = new Date();
  if (session.expiresAt <= now) {
    await Session.findOneAndUpdate({ userId }, { revokedAt: now, revoked: true });
    throw new Error('Token already expired');
  }

  await Session.findOneAndUpdate({ userId }, { revokedAt: now, revoked: true });
};

export const softDeleteUser = async (userId: string, deletionReason = 'USER_REQUESTED') => {
  const timestamp = Date.now();
  const anonymizedEmail = `deleted_${timestamp}_${userId.slice(-6)}@deleted.com`;

  return User.findByIdAndUpdate(
    userId,
    { deletedAt: new Date(), email: anonymizedEmail, isActive: false, deletionReason },
    { new: true, select: 'id email isActive deletedAt deletionReason' },
  );
};

export const restoreUser = async (userId: string) => {
  return User.findByIdAndUpdate(
    userId,
    { deletedAt: null, isActive: true, deletionReason: null },
    { new: true, select: 'id email isActive deletedAt deletionReason' },
  );
};
