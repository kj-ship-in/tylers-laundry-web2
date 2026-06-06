"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableBiometricsController = exports.changePinController = exports.createPinController = exports.changePasswordController = void 0;
const userSecurity_service_1 = require("../services/userSecurity.service");
const user_security_schema_1 = require("../validators/user.security.schema");
const changePasswordController = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = user_security_schema_1.ChangePasswordSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await (0, userSecurity_service_1.changePasswordService)(userId, currentPassword, newPassword);
        return res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.changePasswordController = changePasswordController;
const createPinController = async (req, res, next) => {
    try {
        const { pin } = user_security_schema_1.CreatePinSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await (0, userSecurity_service_1.createPinService)(userId, pin);
        return res.status(201).json({ message: 'PIN created successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.createPinController = createPinController;
const changePinController = async (req, res, next) => {
    try {
        const { oldPin, newPin } = user_security_schema_1.ChangePinSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        await (0, userSecurity_service_1.changePinService)(userId, oldPin, newPin);
        return res.status(200).json({ message: 'PIN changed successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.changePinController = changePinController;
const enableBiometricsController = async (req, res, next) => {
    try {
        const { enable } = user_security_schema_1.EnableBiometricsSchema.parse(req.body);
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (enable) {
            await (0, userSecurity_service_1.enableBiometricsService)(userId, enable);
            return res.status(200).json({ message: 'Biometrics enabled' });
        }
        else {
            await (0, userSecurity_service_1.enableBiometricsService)(userId, enable);
            return res.status(200).json({ message: 'Biometrics disabled' });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.enableBiometricsController = enableBiometricsController;
