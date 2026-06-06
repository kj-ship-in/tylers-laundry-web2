"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreUserController = exports.selfDeleteUserController = exports.softDeleteUserController = exports.logoutController = exports.changePasswordController = exports.passwordResetController = exports.validateResetTokenController = exports.requestPasswordResetController = exports.requestVerificationCodeController = exports.refreshTokenController = exports.verifyEmailController = exports.loginUserController = exports.loginAdminController = exports.loginController = exports.registerStaffController = exports.registerAdminController = exports.registerController = void 0;
const authService = __importStar(require("../services/auth.service"));
const email_service_1 = require("../services/email.service");
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const logger_1 = __importDefault(require("../utils/logger"));
const auth_schema_1 = require("../validators/auth.schema");
const registerController = async (req, res, next) => {
    try {
        const { name, email, password } = auth_schema_1.RegisterUserSchema.parse(req.body);
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
    }
    catch (error) {
        next(error);
    }
};
exports.registerController = registerController;
const registerAdminController = async (req, res, next) => {
    try {
        const { name, email, password } = auth_schema_1.RegisterUserSchema.parse(req.body);
        const userExist = await authService.userExists(email);
        if (userExist) {
            res.status(400).json({
                success: false,
                message: 'User already exists',
            });
            return;
        }
        const response = await authService.registerAdmin({ name, email, password }, req.user.id);
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.registerAdminController = registerAdminController;
const registerStaffController = async (req, res, next) => {
    try {
        const { name, email, password } = auth_schema_1.RegisterUserSchema.parse(req.body);
        const userExist = await authService.userExists(email);
        if (userExist) {
            res.status(400).json({
                success: false,
                message: 'User already exists',
            });
            return;
        }
        const response = await authService.registerStaff({ name, email, password }, req.user.id);
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.registerStaffController = registerStaffController;
const loginController = async (req, res, next) => {
    try {
        const { email, password } = auth_schema_1.LoginUserSchema.parse(req.body);
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
        if (!(await (0, hash_1.comparePassword)(password, userExist.password))) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials, your email or password is not correct.',
            });
            return;
        }
        const response = await authService.login(userExist.id);
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
};
exports.loginController = loginController;
// Keep legacy endpoints for backward compatibility
const loginAdminController = async (req, res, next) => {
    await (0, exports.loginController)(req, res, next);
};
exports.loginAdminController = loginAdminController;
const loginUserController = async (req, res, next) => {
    await (0, exports.loginController)(req, res, next);
};
exports.loginUserController = loginUserController;
const verifyEmailController = async (req, res, next) => {
    try {
        const { email, code } = auth_schema_1.VerifyEmailSchema.parse(req.body);
        const userExist = await authService.findOneByEmail(email);
        if (!userExist) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await authService.verifyUserEmail(userExist.id, code);
        await (0, email_service_1.sendWelcomeEmail)(email, userExist.name);
        res
            .status(200)
            .json({ isVerified: true, message: 'Email verified successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmailController = verifyEmailController;
const refreshTokenController = async (req, res, next) => {
    try {
        const { refreshToken } = auth_schema_1.RefreshTokenSchema.parse(req.body);
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token required' });
        }
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const newAccessToken = (0, jwt_1.generateToken)({
            id: payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role,
        });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.refreshTokenController = refreshTokenController;
const requestVerificationCodeController = async (req, res, next) => {
    try {
        const { email } = auth_schema_1.RequestVerificationSchema.parse(req.body);
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
    }
    catch (error) {
        next(error);
    }
};
exports.requestVerificationCodeController = requestVerificationCodeController;
const requestPasswordResetController = async (req, res, next) => {
    try {
        const { email } = auth_schema_1.RequestPasswordResetSchema.parse(req.body);
        const userExist = await authService.findOneByEmail(email);
        if (!userExist) {
            res.status(400).json({ message: 'User does not exist, try again.' });
            return;
        }
        await authService.requestPasswordReset(userExist.id, email);
        res
            .status(200)
            .json({ message: 'Password reset token sent to your email' });
    }
    catch (error) {
        next(error);
    }
};
exports.requestPasswordResetController = requestPasswordResetController;
const validateResetTokenController = async (req, res, next) => {
    try {
        const { resetToken } = auth_schema_1.ResetTokenSchema.parse(req.body);
        const result = await authService.validateResetToken(resetToken);
        if (!result) {
            res.status(400).json({ message: ' Invalid token, try again.' });
            return;
        }
        res
            .status(200)
            .json({ valid: result, message: 'Reset token validated successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.validateResetTokenController = validateResetTokenController;
const passwordResetController = async (req, res, next) => {
    try {
        const { email, newPassword } = auth_schema_1.PasswordResetSchema.parse(req.body);
        const userExist = await authService.findOneByEmail(email);
        if (!userExist) {
            res.status(400).json({ message: 'User does not exist, try again.' });
            return;
        }
        await authService.resetPassword(userExist.id, newPassword);
        res
            .status(200)
            .json({ message: 'Password reset successfully, try login.' });
    }
    catch (error) {
        next(error);
    }
};
exports.passwordResetController = passwordResetController;
const changePasswordController = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = auth_schema_1.ChangePasswordSchema.parse(req.body);
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
        const isOldPasswordValid = await (0, hash_1.comparePassword)(oldPassword, userExist.password);
        if (!isOldPasswordValid) {
            res.status(400).json({
                message: 'Current password is incorrect.',
            });
            return;
        }
        const isSamePassword = await (0, hash_1.comparePassword)(newPassword, userExist.password);
        if (isSamePassword) {
            res.status(400).json({
                message: 'New password must be different from current password.',
            });
            return;
        }
        await authService.changePassword(userId, newPassword);
        res.status(200).json({ message: 'Password changed successfully.' });
    }
    catch (error) {
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
exports.changePasswordController = changePasswordController;
const logoutController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        await authService.logoutService(userId);
        res.status(200).json({ message: 'Logout successful' });
    }
    catch (error) {
        next(error);
    }
};
exports.logoutController = logoutController;
const softDeleteUserController = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { deletionReason, currentPassword } = auth_schema_1.SoftDeleteUserSchema.parse(req.body);
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
        const isPasswordValid = await (0, hash_1.comparePassword)(currentPassword, currentUser.password);
        if (!isPasswordValid) {
            res.status(400).json({
                message: 'Invalid password. Please enter your current password to confirm account deletion.',
            });
            return;
        }
        const user = await authService.softDeleteUser(userId, deletionReason ?? 'USER_REQUESTED');
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
    }
    catch (error) {
        logger_1.default.error('Error in softDeleteUserController:', error);
        next(error);
    }
};
exports.softDeleteUserController = softDeleteUserController;
const selfDeleteUserController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { deletionReason, currentPassword } = auth_schema_1.SoftDeleteUserSchema.parse(req.body);
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
        const isPasswordValid = await (0, hash_1.comparePassword)(currentPassword, currentUser.password);
        if (!isPasswordValid) {
            res.status(400).json({
                message: 'Invalid password. Please enter your current password to confirm account deletion.',
            });
            return;
        }
        const user = await authService.softDeleteUser(userId, deletionReason ?? 'USER_REQUESTED');
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
    }
    catch (error) {
        logger_1.default.error('Error in selfDeleteUserController:', error);
        next(error);
    }
};
exports.selfDeleteUserController = selfDeleteUserController;
const restoreUserController = async (req, res, next) => {
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
    }
    catch (error) {
        logger_1.default.error('Error in restoreUserController:', error);
        next(error);
    }
};
exports.restoreUserController = restoreUserController;
