/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

import * as authService from '../services/auth.service';
import { sendWelcomeEmail } from '../services/email.service';
import { comparePassword } from '../utils/hash';
import {
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from '../utils/jwt';
import logger from '../utils/logger';
import {
  ChangePasswordSchema,
  LoginUserSchema,
  PasswordResetSchema,
  RefreshTokenSchema,
  RegisterUserSchema,
  RequestPasswordResetSchema,
  RequestVerificationSchema,
  ResetTokenSchema,
  SoftDeleteUserSchema,
  VerifyEmailSchema,
} from '../validators/auth.schema';

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = RegisterUserSchema.parse(req.body);

    const userExist = await authService.userExists(email);
    if (userExist) {
      res.status(400).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    const response = await authService.registerUser({ name, email, password });

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const registerAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = RegisterUserSchema.parse(req.body);

    const userExist = await authService.userExists(email);
    if (userExist) {
      res.status(400).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    const response = await authService.registerAdmin(
      { name, email, password },
      req.user!.id,
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const registerStaffController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = RegisterUserSchema.parse(req.body);

    const userExist = await authService.userExists(email);
    if (userExist) {
      res.status(400).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    const response = await authService.registerStaff(
      { name, email, password },
      req.user!.id,
    );

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = LoginUserSchema.parse(req.body);
    const userExist = await authService.findOneByEmail(email);

    if (!userExist) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (!userExist.isVerified) {
      res.status(401).json({
        success: false,
        message: 'Email not verified, you need to be verified first.',
      });
      return;
    }

    if (!(await comparePassword(password, userExist.password))) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials, your email or password is not correct.',
      });
      return;
    }

    const response = await authService.login(userExist.id);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Keep legacy endpoints for backward compatibility
export const loginAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await loginController(req, res, next);
};

export const loginUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  await loginController(req, res, next);
};

export const verifyEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, code } = VerifyEmailSchema.parse(req.body);

    const userExist = await authService.findOneByEmail(email);

    if (!userExist) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await authService.verifyUserEmail(userExist.id, code);

    await sendWelcomeEmail(email, userExist.name);

    res
      .status(200)
      .json({ isVerified: true, message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { refreshToken } = RefreshTokenSchema.parse(req.body);

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const payload = verifyRefreshToken(refreshToken) as any;
    const newAccessToken = generateToken({
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    });

    return res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const requestVerificationCodeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = RequestVerificationSchema.parse(req.body);
    const userExist = await authService.findOneByEmail(email);

    if (!userExist) {
      res.status(400).json({ message: 'User does not exist, try again.' });
      return;
    }
    if (userExist.isVerified) {
      res.status(400).json({ message: 'User already verified' });
      return;
    }
    const userId = userExist.id;
    await authService.requestVerificationCode(userId, email);

    res.status(200).json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordResetController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = RequestPasswordResetSchema.parse(req.body);

    const userExist = await authService.findOneByEmail(email);

    if (!userExist) {
      res.status(400).json({ message: 'User does not exist, try again.' });
      return;
    }

    await authService.requestPasswordReset(userExist.id, email);

    res
      .status(200)
      .json({ message: 'Password reset token sent to your email' });
  } catch (error) {
    next(error);
  }
};

export const validateResetTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { resetToken } = ResetTokenSchema.parse(req.body);

    const result = await authService.validateResetToken(resetToken);

    if (!result) {
      res.status(400).json({ message: ' Invalid token, try again.' });
      return;
    }

    res
      .status(200)
      .json({ valid: result, message: 'Reset token validated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const passwordResetController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, newPassword } = PasswordResetSchema.parse(req.body);

    const userExist = await authService.findOneByEmail(email);

    if (!userExist) {
      res.status(400).json({ message: 'User does not exist, try again.' });
      return;
    }

    await authService.resetPassword(userExist.id, newPassword);

    res
      .status(200)
      .json({ message: 'Password reset successfully, try login.' });
  } catch (error) {
    next(error);
  }
};

export const changePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { oldPassword, newPassword } = ChangePasswordSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      res
        .status(401)
        .json({ message: 'Unauthorized: User not authenticated.' });
      return;
    }

    const userExist = await authService.findOneById(userId);

    if (!userExist) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const isOldPasswordValid = await comparePassword(
      oldPassword,
      userExist.password,
    );

    if (!isOldPasswordValid) {
      res.status(400).json({
        message: 'Current password is incorrect.',
      });
      return;
    }

    const isSamePassword = await comparePassword(
      newPassword,
      userExist.password,
    );
    if (isSamePassword) {
      res.status(400).json({
        message: 'New password must be different from current password.',
      });
      return;
    }

    await authService.changePassword(userId, newPassword);

    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({
        message: 'Invalid input data.',
        errors: error.message,
      });
      return;
    }

    next(error);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await authService.logoutService(userId);
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

export const softDeleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { deletionReason, currentPassword } = SoftDeleteUserSchema.parse(
      req.body,
    );

    if (!currentPassword) {
      res.status(400).json({
        message: 'Password is required to delete account',
      });
      return;
    }

    if (req.user?.id !== userId) {
      res
        .status(403)
        .json({ message: 'Forbidden: Cannot delete this account' });
      return;
    }

    const currentUser = await authService.findOneById(userId);

    if (!currentUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      currentUser.password,
    );

    if (!isPasswordValid) {
      res.status(400).json({
        message:
          'Invalid password. Please enter your current password to confirm account deletion.',
      });
      return;
    }

    const user = await authService.softDeleteUser(
      userId,
      deletionReason ?? 'USER_REQUESTED',
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'User account deleted successfully',
      data: {
        id: user.id,
        email: user.email,
        deletedAt: user.deletedAt,
        deletionReason: user.deletionReason,
      },
    });
  } catch (error) {
    logger.error('Error in softDeleteUserController:', error);
    next(error);
  }
};

export const selfDeleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { deletionReason, currentPassword } = SoftDeleteUserSchema.parse(
      req.body,
    );

    if (!currentPassword) {
      res.status(400).json({
        message: 'Password is required to delete account',
      });
      return;
    }

    const currentUser = await authService.findOneById(userId);

    if (!currentUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isPasswordValid = await comparePassword(
      currentPassword,
      currentUser.password,
    );

    if (!isPasswordValid) {
      res.status(400).json({
        message:
          'Invalid password. Please enter your current password to confirm account deletion.',
      });
      return;
    }

    const user = await authService.softDeleteUser(
      userId,
      deletionReason ?? 'USER_REQUESTED',
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      message: 'Your account has been deleted successfully',
      data: {
        id: user.id,
        email: user.email,
        deletedAt: user.deletedAt,
        deletionReason: user.deletionReason,
      },
    });
  } catch (error) {
    logger.error('Error in selfDeleteUserController:', error);
    next(error);
  }
};

export const restoreUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.params.id;

    if (req.user?.id !== userId) {
      return res
        .status(403)
        .json({ message: 'Forbidden: Cannot restore this account' });
    }

    const user = await authService.restoreUser(userId);

    return res.status(200).json({
      message: 'User restored successfully',
      data: user,
    });
  } catch (error) {
    logger.error('Error in restoreUserController:', error);
    next(error);
  }
};
