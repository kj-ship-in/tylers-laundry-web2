"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableBiometricsService = exports.changePinService = exports.createPinService = exports.changePasswordService = void 0;
const user_model_1 = require("../models/user.model");
const hash_1 = require("../utils/hash");
const changePasswordService = async (userId, oldPassword, newPassword) => {
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new Error('User not found');
    const isMatch = await (0, hash_1.comparePassword)(oldPassword, user.password);
    if (!isMatch)
        throw new Error('Old password is incorrect');
    const hashedNewPassword = await (0, hash_1.hashPassword)(newPassword);
    await user_model_1.User.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
        passwordUpdatedAt: new Date(),
    });
};
exports.changePasswordService = changePasswordService;
const createPinService = async (userId, pin) => {
    const hashedPin = await (0, hash_1.hashPassword)(pin);
    await user_model_1.User.findByIdAndUpdate(userId, { pin: hashedPin });
};
exports.createPinService = createPinService;
const changePinService = async (userId, oldPin, newPin) => {
    const user = await user_model_1.User.findById(userId);
    if (!user?.pin)
        throw new Error('No PIN set');
    const isMatch = await (0, hash_1.comparePassword)(oldPin, user.pin);
    if (!isMatch)
        throw new Error('Old PIN is incorrect');
    const hashedNewPin = await (0, hash_1.hashPassword)(newPin);
    await user_model_1.User.findByIdAndUpdate(userId, { pin: hashedNewPin });
};
exports.changePinService = changePinService;
const enableBiometricsService = async (userId, isBiometricsEnabled) => {
    await user_model_1.User.findByIdAndUpdate(userId, { isBiometricsEnabled });
};
exports.enableBiometricsService = enableBiometricsService;
