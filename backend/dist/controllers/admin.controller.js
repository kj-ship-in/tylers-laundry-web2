import { getDashboardDataService, getBookingReportsService, deleteStaffService, updateUserStatusService, deleteCustomerService, } from '../services/admin.service';
export const getDashboardDataController = async (_, res, next) => {
    try {
        const data = await getDashboardDataService();
        return res.status(200).json({ message: 'Dashboard data fetched', data });
    }
    catch (error) {
        next(error);
    }
};
export const getBookingReportsController = async (req, res, next) => {
    try {
        const { from, to } = req.query;
        if (!from || !to) {
            return res
                .status(400)
                .json({ message: "'from' and 'to' query parameters are required" });
        }
        const data = await getBookingReportsService(new Date(from), new Date(to));
        return res.status(200).json({ message: 'Booking report fetched', data });
    }
    catch (error) {
        next(error);
    }
};
export const deleteStaffController = async (req, res, next) => {
    try {
        const staffId = parseInt(req.params.id, 10);
        if (isNaN(staffId)) {
            return res.status(400).json({ message: 'Invalid staff ID' });
        }
        const deletedStaff = await deleteStaffService(staffId);
        return res.status(200).json({
            message: 'Staff deleted successfully',
            data: deletedStaff,
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateUserStatusController = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id, 10);
        const { isActive } = req.body;
        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }
        const updatedUser = await updateUserStatusService(userId, isActive);
        return res.status(200).json({
            message: `User status updated to ${isActive ? 'active' : 'inactive'} successfully`,
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteCustomerController = async (req, res, next) => {
    try {
        const customerId = parseInt(req.params.id, 10);
        if (isNaN(customerId)) {
            return res.status(400).json({ message: 'Invalid customer ID' });
        }
        const deletedCustomer = await deleteCustomerService(customerId);
        return res.status(200).json({
            message: 'Customer deleted successfully',
            data: deletedCustomer,
        });
    }
    catch (error) {
        next(error);
    }
};
