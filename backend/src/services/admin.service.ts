import { Booking } from '../models/booking.model';
import { Payment } from '../models/payment.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { BookingStatus, PaymentStatus } from '../types/enums';

export const getDashboardDataService = async () => {
  const [userRole, staffRole] = await Promise.all([
    Role.findOne({ name: 'USER' }),
    Role.findOne({ name: 'STAFF' }),
  ]);

  const [totalUsers, totalStaff, totalCustomers, totalBookings, pendingBookings, completedBookings] =
    await Promise.all([
      User.countDocuments(),
      staffRole ? User.countDocuments({ roleId: staffRole._id }) : 0,
      userRole ? User.countDocuments({ roleId: userRole._id }) : 0,
      Booking.countDocuments(),
      Booking.countDocuments({ status: BookingStatus.PENDING }),
      Booking.countDocuments({ status: BookingStatus.COMPLETED }),
    ]);

  const revenueResult = await Payment.aggregate([
    { $match: { status: PaymentStatus.PAID } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revenueResult[0]?.total ?? 0;

  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId')
    .populate('serviceId')
    .populate('payments');

  return {
    users: { totalUsers, totalStaff, totalCustomers },
    bookings: { totalBookings, pendingBookings, completedBookings, recentBookings },
    revenue: totalRevenue,
  };
};

export const getBookingReportsService = async (from: Date, to: Date) => {
  const bookings = await Booking.find({ date: { $gte: from, $lte: to } })
    .populate('userId')
    .populate('serviceId')
    .populate('payments');

  const revenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
  return { bookings, revenue };
};

export const deleteStaffService = async (staffId: string) => {
  const staff = await User.findById(staffId).populate('roleId');
  if (!staff) throw new Error('Staff not found');
  if ((staff.roleId as any)?.name !== 'STAFF') throw new Error('User is not a staff member');

  const timestamp = Date.now();
  const anonymizedEmail = `deleted_staff_${timestamp}_${staffId.slice(-6)}@deleted.com`;

  return User.findByIdAndUpdate(
    staffId,
    { deletedAt: new Date(), email: anonymizedEmail, isActive: false, deletionReason: 'ADMIN_DELETED' },
    { new: true, select: 'id email isActive deletedAt deletionReason' },
  );
};

export const updateUserStatusService = async (userId: string, isActive: boolean) => {
  const user = await User.findById(userId).populate('roleId');
  if (!user) throw new Error('User not found');

  return User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true, select: 'id email name isActive' },
  );
};

export const deleteCustomerService = async (customerId: string) => {
  const customer = await User.findById(customerId).populate('roleId');
  if (!customer) throw new Error('Customer not found');
  if ((customer.roleId as any)?.name !== 'USER') throw new Error('User is not a customer');

  const timestamp = Date.now();
  const anonymizedEmail = `deleted_customer_${timestamp}_${customerId.slice(-6)}@deleted.com`;

  return User.findByIdAndUpdate(
    customerId,
    { deletedAt: new Date(), email: anonymizedEmail, isActive: false, deletionReason: 'ADMIN_DELETED' },
    { new: true, select: 'id email isActive deletedAt deletionReason' },
  );
};
