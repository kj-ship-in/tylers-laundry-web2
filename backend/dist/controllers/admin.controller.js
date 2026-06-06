"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPermissionsController = exports.deleteCustomerController = exports.updateUserStatusController = exports.deleteStaffController = exports.getBookingReportsController = exports.getDashboardDataController = void 0;
const admin_service_1 = require("../services/admin.service");
const enums_1 = require("../types/enums");
const getDashboardDataController = async (_, res, next) => {
    try {
        const data = await (0, admin_service_1.getDashboardDataService)();
        return res.status(200).json({ message: 'Dashboard data fetched', data });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardDataController = getDashboardDataController;
const getBookingReportsController = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res
                .status(400)
                .json({ message: "'from' and 'to' query parameters are required" });
        }
        const data = await (0, admin_service_1.getBookingReportsService)(new Date(from), new Date(to));
        return res.status(200).json({ message: 'Booking report fetched', data });
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingReportsController = getBookingReportsController;
const deleteStaffController = async (req, res, next) => {
    try {
        const staffId = req.params.id;
        const deletedStaff = await (0, admin_service_1.deleteStaffService)(staffId);
        return res.status(200).json({
            message: 'Staff deleted successfully',
            data: deletedStaff,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteStaffController = deleteStaffController;
const updateUserStatusController = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { isActive } = req.body;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }
        const updatedUser = await (0, admin_service_1.updateUserStatusService)(userId, isActive);
        return res.status(200).json({
            message: `User status updated to ${isActive ? 'active' : 'inactive'} successfully`,
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserStatusController = updateUserStatusController;
const deleteCustomerController = async (req, res, next) => {
    try {
        const customerId = req.params.id;
        const deletedCustomer = await (0, admin_service_1.deleteCustomerService)(customerId);
        return res.status(200).json({
            message: 'Customer deleted successfully',
            data: deletedCustomer,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCustomerController = deleteCustomerController;
const getAllPermissionsController = async (_, res, next) => {
    try {
        const permissions = Object.values(enums_1.Permission);
        return res.status(200).json({
            message: 'All permissions retrieved successfully',
            data: permissions,
            total: permissions.length,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllPermissionsController = getAllPermissionsController;
