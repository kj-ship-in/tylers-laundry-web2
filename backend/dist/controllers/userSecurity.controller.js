import { changePasswordService, createPinService, changePinService, enableBiometricsService, } from '../services/userSecurity.service';
import { ChangePasswordSchema, CreatePinSchema, ChangePinSchema, EnableBiometricsSchema, } from '../validators/user.security.schema';
export const changePasswordController = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await changePasswordService(userId, currentPassword, newPassword);
        return res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const createPinController = async (req, res, next) => {
    try {
        const { pin } = CreatePinSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await createPinService(userId, pin);
        return res.status(201).json({ message: 'PIN created successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const changePinController = async (req, res, next) => {
    try {
        const { oldPin, newPin } = ChangePinSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await changePinService(userId, oldPin, newPin);
        return res.status(200).json({ message: 'PIN changed successfully' });
    }
    catch (error) {
        next(error);
    }
};
export const enableBiometricsController = async (req, res, next) => {
    try {
        const { enable } = EnableBiometricsSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (enable) {
            await enableBiometricsService(userId, enable);
            return res.status(200).json({ message: 'Biometrics enabled' });
        }
        else {
            await enableBiometricsService(userId, enable);
            return res.status(200).json({ message: 'Biometrics disabled' });
        }
    }
    catch (error) {
        next(error);
    }
};
