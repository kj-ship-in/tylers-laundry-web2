"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const permission_middleware_1 = require("../middlewares/permission.middleware");
const enums_1 = require("../types/enums");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
// User routes - any authenticated user can create and view their own bookings
router.get('/my-bookings', (0, permission_middleware_1.requirePermission)(enums_1.Permission.BOOKING_VIEW_OWN), booking_controller_1.getBookingsByUserIdController);
router.post('/create', (0, permission_middleware_1.requirePermission)(enums_1.Permission.BOOKING_CREATE), booking_controller_1.createBookingController);
router.post('/schedule-pickup', (0, permission_middleware_1.requirePermission)(enums_1.Permission.BOOKING_CREATE), booking_controller_1.schedulePickupController);
// Ownership-based routes - user can view/update their own booking, or admin can view all
router.get('/get/:id', (0, permission_middleware_1.requireOwnershipOrAdmin)(_ => {
    // This would need to be implemented to get the booking's user ID
    // For now, we'll use a simpler approach
    return null; // TODO: Implement proper ownership check
}, enums_1.Permission.BOOKING_VIEW_ALL), booking_controller_1.getBookingByIdController);
router.put('/update/:id', (0, permission_middleware_1.requireOwnershipOrAdmin)(_ => null, // TODO: Implement proper ownership check
enums_1.Permission.BOOKING_UPDATE), booking_controller_1.updateBookingController);
// Admin/Staff only routes
router.get('/getAll', (0, permission_middleware_1.requirePermission)(enums_1.Permission.BOOKING_VIEW_ALL), booking_controller_1.getAllBookingsController);
router.patch('/update-status/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.BOOKING_UPDATE_STATUS), booking_controller_1.updateBookingStatusController);
router.delete('/delete/:id', (0, permission_middleware_1.requirePermission)(enums_1.Permission.BOOKING_DELETE), booking_controller_1.deleteBookingController);
router.post('/admin/create-for-client', (0, permission_middleware_1.requirePermission)(enums_1.Permission.BOOKING_CREATE_FOR_CLIENT), booking_controller_1.adminCreateBookingController);
exports.default = router;
