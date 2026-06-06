import { User } from '../models/user.model';
import { comparePassword, hashPassword } from '../utils/hash';

export const changePasswordService = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) throw new Error('Old password is incorrect');

  const hashedNewPassword = await hashPassword(newPassword);
  await User.findByIdAndUpdate(userId, {
    password: hashedNewPassword,
    passwordUpdatedAt: new Date(),
  });
};

export const createPinService = async (userId: string, pin: string): Promise<void> => {
  const hashedPin = await hashPassword(pin);
  await User.findByIdAndUpdate(userId, { pin: hashedPin });
};

export const changePinService = async (
  userId: string,
  oldPin: string,
  newPin: string,
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user?.pin) throw new Error('No PIN set');

  const isMatch = await comparePassword(oldPin, user.pin);
  if (!isMatch) throw new Error('Old PIN is incorrect');

  const hashedNewPin = await hashPassword(newPin);
  await User.findByIdAndUpdate(userId, { pin: hashedNewPin });
};

export const enableBiometricsService = async (
  userId: string,
  isBiometricsEnabled: boolean,
): Promise<void> => {
  await User.findByIdAndUpdate(userId, { isBiometricsEnabled });
};
