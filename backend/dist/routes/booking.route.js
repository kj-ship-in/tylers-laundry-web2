import express from 'express';
import { createBookingController, getAllBookingsController, getBookingsByUserIdController, getBookingByIdController, updateBookingController, deleteBookingController, updateBookingStatusController, schedulePickupController, adminCreateBookingController, } from '../controllers/booking.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requirePermission, requireOwnershipOrAdmin, } from '../middlewares/permission.middleware';
import { Permission } from '../types/enums';
const router = express.Router();
router.use(authMiddleware);
// User routes - any authenticated user can create and view their own bookings
router.get('/my-bookings', requirePermission(Permission.BOOKING_VIEW_OWN), getBookingsByUserIdController);
router.post('/create', requirePermission(Permission.BOOKING_CREATE), createBookingController);
router.post('/schedule-pickup', requirePermission(Permission.BOOKING_CREATE), schedulePickupController);
// Ownership-based routes - user can view/update their own booking, or admin can view all
router.get('/get/:id', requireOwnershipOrAdmin(_ => {
    // This would need to be implemented to get the booking's user ID
    // For now, we'll use a simpler approach
    return null; // TODO: Implement proper ownership check
}, Permission.BOOKING_VIEW_ALL), getBookingByIdController);
router.put('/update/:id', requireOwnershipOrAdmin(_ => null, // TODO: Implement proper ownership check
Permission.BOOKING_UPDATE), updateBookingController);
// Admin/Staff only routes
router.get('/getAll', requirePermission(Permission.BOOKING_VIEW_ALL), getAllBookingsController);
router.patch('/update-status/:id', requirePermission(Permission.BOOKING_UPDATE_STATUS), updateBookingStatusController);
router.delete('/delete/:id', requirePermission(Permission.BOOKING_DELETE), deleteBookingController);
router.post('/admin/create-for-client', requirePermission(Permission.BOOKING_CREATE_FOR_CLIENT), adminCreateBookingController);
export default router;
