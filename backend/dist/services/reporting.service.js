"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportingService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const exceljs_1 = __importDefault(require("exceljs"));
const booking_model_1 = require("../models/booking.model");
const invoice_model_1 = require("../models/invoice.model");
const payment_model_1 = require("../models/payment.model");
const role_model_1 = require("../models/role.model");
const service_model_1 = require("../models/service.model");
const user_model_1 = require("../models/user.model");
const enums_1 = require("../types/enums");
const excel_generator_1 = __importDefault(require("../utils/excel-generator"));
const ReportingService = {
    async generateFinancialReport(filters) {
        const { startDate, endDate } = filters;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const [payments, invoices, revenueByService] = await Promise.all([
            payment_model_1.Payment.find({ createdAt: { $gte: start, $lte: end }, status: enums_1.PaymentStatus.PAID }).populate({
                path: 'bookingId',
                populate: [{ path: 'userId' }, { path: 'serviceId' }],
            }),
            invoice_model_1.Invoice.find({ issuedAt: { $gte: start, $lte: end } }).populate({
                path: 'paymentId',
                populate: { path: 'bookingId', populate: [{ path: 'userId' }, { path: 'serviceId' }] },
            }),
            booking_model_1.Booking.aggregate([
                { $match: { createdAt: { $gte: start, $lte: end }, status: enums_1.BookingStatus.COMPLETED } },
                { $group: { _id: '$serviceId', totalAmount: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
                { $sort: { totalAmount: -1 } },
            ]),
        ]);
        const services = await service_model_1.Service.find();
        const revenueByServiceWithDetails = revenueByService.map((revenue) => {
            const service = services.find(s => s._id.toString() === revenue._id.toString());
            return {
                type: service?.type ?? 'Unknown',
                totalRevenue: revenue.totalAmount ?? 0,
                orderCount: revenue.count,
                averagePrice: revenue.count > 0 ? revenue.totalAmount / revenue.count : 0,
            };
        });
        const summary = {
            totalRevenue: payments.reduce((sum, p) => sum + Number(p.amount), 0),
            totalPayments: payments.length,
            averageOrderValue: payments.length > 0
                ? payments.reduce((sum, p) => sum + Number(p.amount), 0) / payments.length
                : 0,
            paidInvoices: invoices.filter(inv => inv.status === 'PAID').length,
            unpaidInvoices: invoices.filter(inv => inv.status === 'UNPAID').length,
            totalTax: invoices.reduce((sum, inv) => sum + Number(inv.tax), 0),
            totalDiscounts: invoices.reduce((sum, inv) => sum + Number(inv.discount), 0),
        };
        const reportData = { summary, payments, revenueByService: revenueByServiceWithDetails };
        if (filters.format === 'excel') {
            const excelBuffer = await excel_generator_1.default.generateFinancialReport(reportData);
            const filename = `financial-report-${Date.now()}.xlsx`;
            const filepath = await excel_generator_1.default.saveExcelToFile(excelBuffer, filename);
            return { buffer: excelBuffer, filepath, filename, format: 'excel' };
        }
        return { data: reportData, format: 'json' };
    },
    async generateCustomerReport(filters) {
        const where = {};
        if (filters.status)
            where.isActive = filters.status === 'active';
        if (filters.startDate && filters.endDate) {
            where.createdAt = { $gte: new Date(filters.startDate), $lte: new Date(filters.endDate) };
        }
        const customers = await user_model_1.User.find(where).sort({ createdAt: -1 });
        const customersWithStats = await Promise.all(customers.map(async (customer) => {
            const bookings = await booking_model_1.Booking.find({ userId: customer._id });
            const bookingIds = bookings.map(b => b._id);
            const payments = await payment_model_1.Payment.find({ bookingId: { $in: bookingIds } });
            const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount), 0);
            return {
                ...customer.toObject(),
                bookings,
                totalSpent,
                lastBookingDate: bookings.length > 0
                    ? Math.max(...bookings.map(b => new Date(b.date).getTime()))
                    : null,
            };
        }));
        if (filters.format === 'excel') {
            const excelBuffer = await excel_generator_1.default.generateCustomerReport(customersWithStats, filters);
            const filename = `customer-report-${Date.now()}.xlsx`;
            const filepath = await excel_generator_1.default.saveExcelToFile(excelBuffer, filename);
            return { buffer: excelBuffer, filepath, filename, format: 'excel' };
        }
        return { data: customersWithStats, format: 'json' };
    },
    async generateServicePerformanceReport(filters) {
        const { startDate, endDate } = filters;
        const serviceStats = await service_model_1.Service.find();
        const reportData = await Promise.all(serviceStats.map(async (service) => {
            const bookings = await booking_model_1.Booking.find({
                serviceId: service._id,
                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            });
            const bookingIds = bookings.map(b => b._id);
            const payments = await payment_model_1.Payment.find({ bookingId: { $in: bookingIds } });
            const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
            const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
            return {
                serviceName: service.type,
                description: service.description,
                basePrice: service.price,
                totalBookings: bookings.length,
                totalRevenue,
                averageRevenue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
                completedBookings: completedCount,
                cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
                conversionRate: bookings.length > 0 ? (completedCount / bookings.length) * 100 : 0,
            };
        }));
        if (filters.format === 'excel') {
            const workbook = new exceljs_1.default.Workbook();
            const worksheet = workbook.addWorksheet('Service Performance');
            worksheet.columns = [
                { header: 'Service Name', key: 'serviceName', width: 25 },
                { header: 'Description', key: 'description', width: 30 },
                { header: 'Base Price', key: 'basePrice', width: 12 },
                { header: 'Total Bookings', key: 'totalBookings', width: 15 },
                { header: 'Total Revenue', key: 'totalRevenue', width: 15 },
                { header: 'Average Revenue', key: 'averageRevenue', width: 15 },
                { header: 'Completed', key: 'completedBookings', width: 12 },
                { header: 'Cancelled', key: 'cancelledBookings', width: 12 },
                { header: 'Conversion Rate %', key: 'conversionRate', width: 15 },
            ];
            reportData.forEach(s => worksheet.addRow(s));
            const excelBuffer = await workbook.xlsx.writeBuffer();
            const filename = `service-performance-${Date.now()}.xlsx`;
            const filepath = await excel_generator_1.default.saveExcelToFile(excelBuffer, filename);
            return { buffer: excelBuffer, filepath, filename, format: 'excel' };
        }
        return { data: reportData, format: 'json' };
    },
    async getDashboardStats() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const userRole = await role_model_1.Role.findOne({ name: 'USER' });
        const [totalCustomers, totalBookings, activeBookings, pendingPayments, monthlyRevenue, yearlyRevenue, pendingBookings, completedBookings, unpaidInvoices, recentPayments,] = await Promise.all([
            userRole ? user_model_1.User.countDocuments({ roleId: userRole._id, isActive: true }) : 0,
            booking_model_1.Booking.countDocuments({ status: { $in: [enums_1.BookingStatus.PENDING, enums_1.BookingStatus.IN_PROGRESS] } }),
            payment_model_1.Payment.countDocuments({ status: enums_1.PaymentStatus.PENDING }),
            booking_model_1.Booking.countDocuments(),
            payment_model_1.Payment.aggregate([
                { $match: { status: enums_1.PaymentStatus.PAID, createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            payment_model_1.Payment.aggregate([
                { $match: { status: enums_1.PaymentStatus.PAID, createdAt: { $gte: startOfYear } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.PENDING }),
            booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.COMPLETED }),
            invoice_model_1.Invoice.countDocuments({ status: enums_1.InvoiceStatus.UNPAID }),
            payment_model_1.Payment.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate({
                path: 'bookingId',
                populate: [
                    { path: 'userId', select: 'id name email' },
                    { path: 'serviceId', select: 'id title type' },
                ],
            }),
        ]);
        return {
            totalCustomers,
            totalBookings,
            activeBookings,
            pendingPayments,
            monthlyRevenue: monthlyRevenue[0]?.total ?? 0,
            yearlyRevenue: yearlyRevenue[0]?.total ?? 0,
            pendingBookings,
            completedBookings,
            unpaidInvoices,
            recentPayments,
        };
    },
    async getMonthlyTrends() {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const monthlyData = await payment_model_1.Payment.aggregate([
            { $match: { status: enums_1.PaymentStatus.PAID, createdAt: { $gte: oneYearAgo } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        return Array.from({ length: 12 }, (_, index) => {
            const month = new Date();
            month.setMonth(month.getMonth() - (11 - index));
            const found = monthlyData.find((d) => d._id.year === month.getFullYear() && d._id.month === month.getMonth() + 1);
            return {
                month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                revenue: found?.totalAmount ?? 0,
                bookings: found?.count ?? 0,
            };
        });
    },
    async getRevenueLineChartData(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const dailyRevenue = await payment_model_1.Payment.aggregate([
            { $match: { status: enums_1.PaymentStatus.PAID, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' },
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]);
        const chartData = Array.from({ length: days }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - index));
            date.setHours(0, 0, 0, 0);
            const found = dailyRevenue.find((d) => d._id.year === date.getFullYear() &&
                d._id.month === date.getMonth() + 1 &&
                d._id.day === date.getDate());
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: found?.totalAmount ?? 0,
                bookings: found?.count ?? 0,
            };
        });
        return {
            labels: chartData.map(d => d.date),
            datasets: [
                {
                    label: 'Revenue (GMD)',
                    data: chartData.map(d => d.revenue),
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: 'Bookings',
                    data: chartData.map(d => d.bookings),
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    },
    async getBookingStatusBarChartData() {
        const bookingsByStatus = await booking_model_1.Booking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]);
        const statusLabels = {
            PENDING: 'Pending',
            IN_PROGRESS: 'In Progress',
            COMPLETED: 'Completed',
            DELIVERED: 'Delivered',
            CANCELLED: 'Cancelled',
        };
        const statusColors = {
            PENDING: '#FFC107',
            IN_PROGRESS: '#2196F3',
            COMPLETED: '#4CAF50',
            DELIVERED: '#8BC34A',
            CANCELLED: '#F44336',
        };
        const data = bookingsByStatus.map((item) => ({
            status: statusLabels[item._id] ?? item._id,
            count: item.count,
            color: statusColors[item._id] ?? '#999999',
        }));
        return {
            labels: data.map(d => d.status),
            datasets: [
                {
                    label: 'Number of Bookings',
                    data: data.map(d => d.count),
                    backgroundColor: data.map(d => d.color),
                    borderColor: data.map(d => d.color),
                    borderWidth: 1,
                },
            ],
        };
    },
    async getServiceRevenueDonutData() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const serviceRevenue = await booking_model_1.Booking.aggregate([
            { $match: { status: enums_1.BookingStatus.COMPLETED, createdAt: { $gte: startOfMonth } } },
            { $group: { _id: '$serviceId', totalAmount: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        ]);
        const services = await service_model_1.Service.find();
        const donutData = serviceRevenue
            .map((item) => {
            const service = services.find(s => s._id.toString() === item._id.toString());
            return {
                serviceName: service?.title ?? 'Unknown',
                revenue: Number(item.totalAmount ?? 0),
                bookings: item.count,
            };
        })
            .sort((a, b) => b.revenue - a.revenue);
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#4CAF50'];
        return {
            labels: donutData.map((d) => d.serviceName),
            datasets: [
                {
                    label: 'Revenue by Service (GMD)',
                    data: donutData.map((d) => d.revenue),
                    backgroundColor: colors.slice(0, donutData.length),
                    borderColor: colors.slice(0, donutData.length),
                    borderWidth: 2,
                },
            ],
            details: donutData,
        };
    },
    async getPaymentMethodDonutData() {
        const paymentMethods = await payment_model_1.Payment.aggregate([
            { $match: { status: enums_1.PaymentStatus.PAID } },
            { $group: { _id: '$method', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]);
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
        const data = paymentMethods.map((item, index) => ({
            method: item._id ?? 'Unknown',
            amount: Number(item.totalAmount ?? 0),
            count: item.count,
            color: colors[index % colors.length],
        }));
        return {
            labels: data.map(d => d.method),
            datasets: [
                {
                    label: 'Revenue by Payment Method (GMD)',
                    data: data.map(d => d.amount),
                    backgroundColor: data.map(d => d.color),
                    borderColor: data.map(d => d.color),
                    borderWidth: 2,
                },
            ],
            details: data,
        };
    },
    async getDailyBookingComparisonData(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const bookings = await booking_model_1.Booking.find({ createdAt: { $gte: startDate } }).select('createdAt status');
        const chartData = Array.from({ length: days }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - index));
            date.setHours(0, 0, 0, 0);
            const dayBookings = bookings.filter(b => {
                const d = new Date(b.createdAt);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === date.getTime();
            });
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                pending: dayBookings.filter(b => b.status === 'PENDING').length,
                inProgress: dayBookings.filter(b => b.status === 'IN_PROGRESS').length,
                completed: dayBookings.filter(b => b.status === 'COMPLETED').length,
                delivered: dayBookings.filter(b => b.status === 'DELIVERED').length,
                cancelled: dayBookings.filter(b => b.status === 'CANCELLED').length,
            };
        });
        return {
            labels: chartData.map(d => d.date),
            datasets: [
                { label: 'Pending', data: chartData.map(d => d.pending), backgroundColor: 'rgba(255, 193, 7, 0.7)', borderColor: '#FFC107' },
                { label: 'In Progress', data: chartData.map(d => d.inProgress), backgroundColor: 'rgba(33, 150, 243, 0.7)', borderColor: '#2196F3' },
                { label: 'Completed', data: chartData.map(d => d.completed), backgroundColor: 'rgba(76, 175, 80, 0.7)', borderColor: '#4CAF50' },
                { label: 'Delivered', data: chartData.map(d => d.delivered), backgroundColor: 'rgba(139, 195, 74, 0.7)', borderColor: '#8BC34A' },
                { label: 'Cancelled', data: chartData.map(d => d.cancelled), backgroundColor: 'rgba(244, 67, 54, 0.7)', borderColor: '#F44336' },
            ],
        };
    },
    async getCustomerAcquisitionLineData(months = 12) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        const userRole = await role_model_1.Role.findOne({ name: 'USER' });
        const customersByMonth = await user_model_1.User.aggregate([
            { $match: { roleId: userRole?._id, createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]);
        const chartData = Array.from({ length: months }, (_, index) => {
            const month = new Date();
            month.setMonth(month.getMonth() - (months - 1 - index));
            const found = customersByMonth.find((d) => d._id.year === month.getFullYear() && d._id.month === month.getMonth() + 1);
            return {
                month: month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                customers: found?.count ?? 0,
            };
        });
        return {
            labels: chartData.map(d => d.month),
            datasets: [
                {
                    label: 'New Customers',
                    data: chartData.map(d => d.customers),
                    borderColor: '#9C27B0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointBackgroundColor: '#9C27B0',
                },
            ],
        };
    },
    async getAllChartData() {
        const [revenueLineChart, bookingStatusBar, serviceRevenueDonut, paymentMethodDonut, dailyBookingComparison, customerAcquisitionLine,] = await Promise.all([
            this.getRevenueLineChartData(),
            this.getBookingStatusBarChartData(),
            this.getServiceRevenueDonutData(),
            this.getPaymentMethodDonutData(),
            this.getDailyBookingComparisonData(),
            this.getCustomerAcquisitionLineData(),
        ]);
        return {
            revenueLineChart,
            bookingStatusBar,
            serviceRevenueDonut,
            paymentMethodDonut,
            dailyBookingComparison,
            customerAcquisitionLine,
        };
    },
    async getStaffPerformanceMetrics() {
        const staffRole = await role_model_1.Role.findOne({ name: 'STAFF' });
        const staffMembers = await user_model_1.User.find({ roleId: staffRole?._id, isActive: true }).select('id name email createdAt');
        return Promise.all(staffMembers.map(async (staff) => {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const [totalBookings, completedBookings, pendingBookings, monthlyBookings, weeklyBookings, monthlyRevenue, weeklyRevenue, completionTimeDocs,] = await Promise.all([
                booking_model_1.Booking.countDocuments({ createdAt: { $gte: staff.createdAt } }),
                booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.COMPLETED, createdAt: { $gte: staff.createdAt } }),
                booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.PENDING, createdAt: { $gte: staff.createdAt } }),
                booking_model_1.Booking.countDocuments({ createdAt: { $gte: startOfMonth } }),
                booking_model_1.Booking.countDocuments({ createdAt: { $gte: startOfWeek } }),
                payment_model_1.Payment.aggregate([
                    { $match: { status: enums_1.PaymentStatus.PAID, bookingId: { $in: await booking_model_1.Booking.find({ createdAt: { $gte: startOfMonth } }).distinct('_id') } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                payment_model_1.Payment.aggregate([
                    { $match: { status: enums_1.PaymentStatus.PAID, bookingId: { $in: await booking_model_1.Booking.find({ createdAt: { $gte: startOfWeek } }).distinct('_id') } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                booking_model_1.Booking.find({ status: enums_1.BookingStatus.COMPLETED, createdAt: { $gte: staff.createdAt } }).select('createdAt updatedAt'),
            ]);
            const completionTimes = completionTimeDocs.map(b => new Date(b.updatedAt).getTime() - new Date(b.createdAt).getTime());
            const avgMs = completionTimes.length > 0
                ? completionTimes.reduce((s, t) => s + t, 0) / completionTimes.length
                : 0;
            return {
                staffId: staff._id.toString(),
                staffName: staff.name,
                staffEmail: staff.email,
                joinDate: staff.createdAt,
                totalBookings,
                completedBookings,
                pendingBookings,
                completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
                monthlyBookings,
                weeklyBookings,
                monthlyRevenue: monthlyRevenue[0]?.total ?? 0,
                weeklyRevenue: weeklyRevenue[0]?.total ?? 0,
                averageCompletionTimeHours: Math.round((avgMs / (1000 * 60 * 60)) * 100) / 100,
            };
        }));
    },
    async getStaffWorkloadDistribution() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const staffRole = await role_model_1.Role.findOne({ name: 'STAFF' });
        const staffMembers = await user_model_1.User.find({ roleId: staffRole?._id, isActive: true }).select('id name email');
        const workloadData = await Promise.all(staffMembers.map(async (staff) => {
            const [pendingBookings, inProgressBookings, completedToday, completedThisMonth] = await Promise.all([
                booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.PENDING }),
                booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.IN_PROGRESS }),
                booking_model_1.Booking.countDocuments({
                    status: enums_1.BookingStatus.COMPLETED,
                    updatedAt: {
                        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                    },
                }),
                booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.COMPLETED, updatedAt: { $gte: startOfMonth } }),
            ]);
            return {
                staffId: staff._id.toString(),
                staffName: staff.name,
                currentWorkload: pendingBookings + inProgressBookings,
                pendingBookings,
                inProgressBookings,
                completedToday,
                completedThisMonth,
            };
        }));
        const [totalPendingBookings, totalInProgressBookings] = await Promise.all([
            booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.PENDING }),
            booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.IN_PROGRESS }),
        ]);
        return {
            totalPendingBookings,
            totalInProgressBookings,
            staffWorkload: workloadData.sort((a, b) => b.currentWorkload - a.currentWorkload),
        };
    },
    async getStaffEfficiencyReport(startDate, endDate) {
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const staffRole = await role_model_1.Role.findOne({ name: 'STAFF' });
        const staffMembers = await user_model_1.User.find({ roleId: staffRole?._id, isActive: true }).select('id name email');
        const efficiencyData = await Promise.all(staffMembers.map(async (staff) => {
            const [totalBookings, completedBookings, revenueGenerated, avgOrderResult] = await Promise.all([
                booking_model_1.Booking.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                booking_model_1.Booking.countDocuments({ status: enums_1.BookingStatus.COMPLETED, createdAt: { $gte: start, $lte: end } }),
                payment_model_1.Payment.aggregate([
                    {
                        $match: {
                            status: enums_1.PaymentStatus.PAID,
                            bookingId: {
                                $in: await booking_model_1.Booking.find({ createdAt: { $gte: start, $lte: end } }).distinct('_id'),
                            },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                booking_model_1.Booking.aggregate([
                    { $match: { createdAt: { $gte: start, $lte: end } } },
                    { $group: { _id: null, avg: { $avg: '$totalAmount' } } },
                ]),
            ]);
            const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
            const revenue = revenueGenerated[0]?.total ?? 0;
            const avgOrderValue = avgOrderResult[0]?.avg ?? 0;
            return {
                staffId: staff._id.toString(),
                staffName: staff.name,
                period: {
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                },
                totalBookings,
                completedBookings,
                completionRate: Math.round(completionRate * 100) / 100,
                revenueGenerated: revenue,
                averageOrderValue: Math.round(Number(avgOrderValue) * 100) / 100,
                customerSatisfaction: 4.5,
                efficiency: (completionRate * Number(revenue)) / 100,
            };
        }));
        return efficiencyData.sort((a, b) => b.efficiency - a.efficiency);
    },
};
exports.ReportingService = ReportingService;
