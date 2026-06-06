import prisma from '../lib/prisma';
import { comparePassword, hashPassword } from '../utils/hash';
export const changePasswordService = async (userId, oldPassword, newPassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new Error('User not found');
    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch)
        throw new Error('Old password is incorrect');
    const hashedNewPassword = await hashPassword(newPassword);
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedNewPassword,
            passwordUpdatedAt: new Date(),
        },
    });
};
export const createPinService = async (userId, pin) => {
    const hashedPin = await hashPassword(pin);
    await prisma.user.update({
        where: { id: userId },
        data: {
            pin: hashedPin,
        },
    });
};
export const changePinService = async (userId, oldPin, newPin) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.pin)
        throw new Error('No PIN set');
    const isMatch = await comparePassword(oldPin, user.pin);
    if (!isMatch)
        throw new Error('Old PIN is incorrect');
    const hashedNewPin = await hashPassword(newPin);
    await prisma.user.update({
        where: { id: userId },
        data: { pin: hashedNewPin },
    });
};
export const enableBiometricsService = async (userId, isBiometricsEnabled) => {
    await prisma.user.update({
        where: { id: userId },
        data: {
            isBiometricsEnabled: isBiometricsEnabled,
        },
    });
};
