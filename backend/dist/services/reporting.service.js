/* eslint-disable @typescript-eslint/no-explicit-any */
import ExcelJS from 'exceljs';
import prisma from '../lib/prisma';
import { BookingStatus, PaymentStatus } from '../prisma/generated/prisma';
import ExcelReportGenerator from '../utils/excel-generator';
const ReportingService = {
    async generateFinancialReport(filters) {
        const { startDate, endDate } = filters;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const [payments, invoices, revenueByService] = await Promise.all([
            prisma.payment.findMany({
                where: {
                    createdAt: {
                        gte: start,
                        lte: end,
                    },
                    status: 'PAID',
                },
                include: {
                    booking: {
                        include: {
                            user: true,
                            service: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.invoice.findMany({
                where: {
                    issuedAt: {
                        gte: start,
                        lte: end,
                    },
                },
                include: {
                    payment: {
                        include: {
                            booking: {
                                include: {
                                    user: true,
                                    service: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.booking.groupBy({
                by: ['serviceId'],
                _sum: { totalAmount: true },
                _count: { id: true },
                where: {
                    createdAt: {
                        gte: start,
                        lte: end,
                    },
                    status: 'COMPLETED',
                },
                orderBy: { _sum: { totalAmount: 'desc' } },
            }),
        ]);
        const services = await prisma.service.findMany();
        const revenueByServiceWithDetails = revenueByService.map(revenue => {
            const service = services.find(s => s.id === revenue.serviceId);
            return {
                type: service?.type ?? 'Unknown',
                totalRevenue: revenue._sum.totalAmount ?? 0,
                orderCount: revenue._count.id,
                averagePrice: Number(revenue._sum.totalAmount ?? 0) / revenue._count.id,
            };
        });
        const summary = {
            totalRevenue: payments.reduce((sum, payment) => sum + Number(payment.amount), 0),
            totalPayments: payments.length,
            averageOrderValue: payments.length > 0
                ? payments.reduce((sum, payment) => sum + Number(payment.amount), 0) /
                    payments.length
                : 0,
            paidInvoices: invoices.filter(inv => inv.status === 'PAID').length,
            unpaidInvoices: invoices.filter(inv => inv.status === 'UNPAID').length,
            totalTax: invoices.reduce((sum, inv) => sum + Number(inv.tax), 0),
            totalDiscounts: invoices.reduce((sum, inv) => sum + Number(inv.discount), 0),
        };
        const reportData = {
            summary,
            payments,
            revenueByService: revenueByServiceWithDetails,
        };
        if (filters.format === 'excel') {
            const excelBuffer = await ExcelReportGenerator.generateFinancialReport(reportData);
            const filename = `financial-report-${Date.now()}.xlsx`;
            const filepath = await ExcelReportGenerator.saveExcelToFile(excelBuffer, filename);
            return {
                buffer: excelBuffer,
                filepath,
                filename,
                format: 'excel',
            };
        }
        return {
            data: reportData,
            format: 'json',
        };
    },
    async generateCustomerReport(filters) {
        const where = {};
        if (filters.status) {
            where.isActive = filters.status === 'active';
        }
        if (filters.startDate && filters.endDate) {
            where.createdAt = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }
        const customers = await prisma.user.findMany({
            where,
            include: {
                bookings: {
                    include: {
                        payments: true,
                    },
                },
                _count: {
                    select: {
                        bookings: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const customersWithStats = customers.map(customer => ({
            ...customer,
            totalSpent: customer.bookings
                .flatMap(booking => booking.payments)
                .reduce((sum, payment) => sum + Number(payment.amount), 0),
            lastBookingDate: customer.bookings.length > 0
                ? Math.max(...customer.bookings.map(b => new Date(b.date).getTime()))
                : null,
        }));
        if (filters.format === 'excel') {
            const excelBuffer = await ExcelReportGenerator.generateCustomerReport(customersWithStats, filters);
            const filename = `customer-report-${Date.now()}.xlsx`;
            const filepath = await ExcelReportGenerator.saveExcelToFile(excelBuffer, filename);
            return {
                buffer: excelBuffer,
                filepath,
                filename,
                format: 'excel',
            };
        }
        return {
            data: customersWithStats,
            format: 'json',
        };
    },
    async generateServicePerformanceReport(filters) {
        const { startDate, endDate } = filters;
        const serviceStats = await prisma.service.findMany({
            include: {
                bookings: {
                    where: {
                        createdAt: {
                            gte: new Date(startDate),
                            lte: new Date(endDate),
                        },
                    },
                    include: {
                        payments: true,
                    },
                },
                _count: {
                    select: {
                        bookings: {
                            where: {
                                createdAt: {
                                    gte: new Date(startDate),
                                    lte: new Date(endDate),
                                },
                            },
                        },
                    },
                },
            },
        });
        const reportData = serviceStats.map(service => ({
            serviceName: service.type,
            description: service.description,
            basePrice: service.price,
            totalBookings: service._count.bookings,
            totalRevenue: service.bookings
                .flatMap(booking => booking.payments)
                .reduce((sum, payment) => sum + Number(payment.amount), 0),
            averageRevenue: service._count.bookings > 0
                ? service.bookings
                    .flatMap(booking => booking.payments)
                    .reduce((sum, payment) => sum + Number(payment.amount), 0) /
                    service._count.bookings
                : 0,
            completedBookings: service.bookings.filter(b => b.status === 'COMPLETED')
                .length,
            cancelledBookings: service.bookings.filter(b => b.status === 'CANCELLED')
                .length,
            conversionRate: service._count.bookings > 0
                ? (service.bookings.filter(b => b.status === 'COMPLETED').length /
                    service._count.bookings) *
                    100
                : 0,
        }));
        if (filters.format === 'excel') {
            const workbook = new ExcelJS.Workbook();
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
            reportData.forEach(service => {
                worksheet.addRow(service);
            });
            const excelBuffer = await workbook.xlsx.writeBuffer();
            const filename = `service-performance-${Date.now()}.xlsx`;
            const filepath = await ExcelReportGenerator.saveExcelToFile(excelBuffer, filename);
            return {
                buffer: excelBuffer,
                filepath,
                filename,
                format: 'excel',
            };
        }
        return {
            data: reportData,
            format: 'json',
        };
    },
    async getDashboardStats() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const [totalCustomers, totalBookings, activeBookings, pendingPayments, monthlyRevenue, yearlyRevenue, pendingBookings, completedBookings, unpaidInvoices, recentPayments,] = await Promise.all([
            prisma.user.count({ where: { role: { name: 'USER' }, isActive: true } }),
            prisma.booking.count({
                where: {
                    status: {
                        in: [BookingStatus.PENDING, BookingStatus.IN_PROGRESS],
                    },
                },
            }),
            prisma.payment.count({
                where: { status: PaymentStatus.PENDING },
            }),
            prisma.booking.count(),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'PAID',
                    createdAt: { gte: startOfMonth },
                },
            }),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'PAID',
                    createdAt: { gte: startOfYear },
                },
            }),
            prisma.booking.count({ where: { status: 'PENDING' } }),
            prisma.booking.count({ where: { status: 'COMPLETED' } }),
            prisma.invoice.count({ where: { status: 'UNPAID' } }),
            prisma.payment.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    method: true,
                    currency: true,
                    createdAt: true,
                    booking: {
                        select: {
                            id: true,
                            totalAmount: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                            service: {
                                select: {
                                    id: true,
                                    title: true,
                                    type: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);
        return {
            totalCustomers,
            totalBookings,
            activeBookings,
            pendingPayments,
            monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
            yearlyRevenue: yearlyRevenue._sum.amount ?? 0,
            pendingBookings,
            completedBookings,
            unpaidInvoices,
            recentPayments,
        };
    },
    async getMonthlyTrends() {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const monthlyData = await prisma.payment.groupBy({
            by: ['createdAt'],
            _sum: { amount: true },
            _count: { id: true },
            where: {
                status: 'PAID',
                createdAt: { gte: oneYearAgo },
            },
            orderBy: { createdAt: 'asc' },
        });
        const monthlyRevenue = Array.from({ length: 12 }, (_, index) => {
            const month = new Date();
            month.setMonth(month.getMonth() - (11 - index));
            const monthData = monthlyData.filter(data => {
                const dataMonth = new Date(data.createdAt);
                return (dataMonth.getMonth() === month.getMonth() &&
                    dataMonth.getFullYear() === month.getFullYear());
            });
            return {
                month: month.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                }),
                revenue: monthData.reduce((sum, data) => sum + Number(data._sum.amount ?? 0), 0),
                bookings: monthData.reduce((sum, data) => sum + data._count.id, 0),
            };
        });
        return monthlyRevenue;
    },
    async getRevenueLineChartData(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const dailyRevenue = await prisma.payment.groupBy({
            by: ['createdAt'],
            _sum: { amount: true },
            _count: { id: true },
            where: {
                status: 'PAID',
                createdAt: { gte: startDate },
            },
            orderBy: { createdAt: 'asc' },
        });
        const chartData = Array.from({ length: days }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - index));
            date.setHours(0, 0, 0, 0);
            const dayData = dailyRevenue.filter(data => {
                const dataDate = new Date(data.createdAt);
                dataDate.setHours(0, 0, 0, 0);
                return dataDate.getTime() === date.getTime();
            });
            return {
                date: date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
                revenue: dayData.reduce((sum, data) => sum + Number(data._sum.amount ?? 0), 0),
                bookings: dayData.reduce((sum, data) => sum + data._count.id, 0),
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
        const bookingsByStatus = await prisma.booking.groupBy({
            by: ['status'],
            _count: { id: true },
        });
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
        const data = bookingsByStatus.map(item => ({
            status: statusLabels[item.status] ?? item.status,
            count: item._count.id,
            color: statusColors[item.status] ?? '#999999',
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
        const serviceRevenue = await prisma.booking.groupBy({
            by: ['serviceId'],
            _sum: { totalAmount: true },
            _count: { id: true },
            where: {
                status: 'COMPLETED',
                createdAt: { gte: startOfMonth },
            },
        });
        const services = await prisma.service.findMany();
        const donutData = serviceRevenue
            .map(item => {
            const service = services.find(s => s.id === item.serviceId);
            return {
                serviceName: service?.title ?? 'Unknown',
                revenue: Number(item._sum.totalAmount ?? 0),
                bookings: item._count.id,
            };
        })
            .sort((a, b) => b.revenue - a.revenue);
        const colors = [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#C9CBCF',
            '#4CAF50',
        ];
        return {
            labels: donutData.map(d => d.serviceName),
            datasets: [
                {
                    label: 'Revenue by Service (GMD)',
                    data: donutData.map(d => d.revenue),
                    backgroundColor: colors.slice(0, donutData.length),
                    borderColor: colors.slice(0, donutData.length),
                    borderWidth: 2,
                },
            ],
            details: donutData,
        };
    },
    async getPaymentMethodDonutData() {
        const paymentMethods = await prisma.payment.groupBy({
            by: ['method'],
            _sum: { amount: true },
            _count: { id: true },
            where: {
                status: 'PAID',
            },
        });
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
        const data = paymentMethods.map((item, index) => ({
            method: item.method ?? 'Unknown',
            amount: Number(item._sum.amount ?? 0),
            count: item._count.id,
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
        const bookingsByStatusAndDate = await prisma.booking.findMany({
            where: {
                createdAt: { gte: startDate },
            },
            select: {
                createdAt: true,
                status: true,
            },
        });
        const chartData = Array.from({ length: days }, (_, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - index));
            date.setHours(0, 0, 0, 0);
            const dayBookings = bookingsByStatusAndDate.filter(booking => {
                const bookingDate = new Date(booking.createdAt);
                bookingDate.setHours(0, 0, 0, 0);
                return bookingDate.getTime() === date.getTime();
            });
            return {
                date: date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                }),
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
                {
                    label: 'Pending',
                    data: chartData.map(d => d.pending),
                    backgroundColor: 'rgba(255, 193, 7, 0.7)',
                    borderColor: '#FFC107',
                },
                {
                    label: 'In Progress',
                    data: chartData.map(d => d.inProgress),
                    backgroundColor: 'rgba(33, 150, 243, 0.7)',
                    borderColor: '#2196F3',
                },
                {
                    label: 'Completed',
                    data: chartData.map(d => d.completed),
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderColor: '#4CAF50',
                },
                {
                    label: 'Delivered',
                    data: chartData.map(d => d.delivered),
                    backgroundColor: 'rgba(139, 195, 74, 0.7)',
                    borderColor: '#8BC34A',
                },
                {
                    label: 'Cancelled',
                    data: chartData.map(d => d.cancelled),
                    backgroundColor: 'rgba(244, 67, 54, 0.7)',
                    borderColor: '#F44336',
                },
            ],
        };
    },
    async getCustomerAcquisitionLineData(months = 12) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        const customersByMonth = await prisma.user.groupBy({
            by: ['createdAt'],
            _count: { id: true },
            where: {
                role: { name: 'USER' },
                createdAt: { gte: startDate },
            },
            orderBy: { createdAt: 'asc' },
        });
        const chartData = Array.from({ length: months }, (_, index) => {
            const month = new Date();
            month.setMonth(month.getMonth() - (months - 1 - index));
            const monthData = customersByMonth.filter(data => {
                const dataMonth = new Date(data.createdAt);
                return (dataMonth.getMonth() === month.getMonth() &&
                    dataMonth.getFullYear() === month.getFullYear());
            });
            return {
                month: month.toLocaleDateString('en-US', {
                    month: 'short',
                    year: '2-digit',
                }),
                customers: monthData.reduce((sum, data) => sum + (data._count?.id ?? 0), 0),
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
        const staffMembers = await prisma.user.findMany({
            where: { role: { name: 'STAFF' }, isActive: true },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        const staffPerformance = await Promise.all(staffMembers.map(async (staff) => {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            // Get bookings handled by this staff (assuming staff are assigned to bookings)
            // For now, we'll track all bookings since staff creation
            const [totalBookings, completedBookings, pendingBookings, monthlyBookings, weeklyBookings, monthlyRevenue, weeklyRevenue, averageCompletionTime,] = await Promise.all([
                prisma.booking.count({
                    where: { createdAt: { gte: staff.createdAt } },
                }),
                prisma.booking.count({
                    where: {
                        status: 'COMPLETED',
                        createdAt: { gte: staff.createdAt },
                    },
                }),
                prisma.booking.count({
                    where: {
                        status: 'PENDING',
                        createdAt: { gte: staff.createdAt },
                    },
                }),
                prisma.booking.count({
                    where: {
                        createdAt: { gte: startOfMonth },
                    },
                }),
                prisma.booking.count({
                    where: {
                        createdAt: { gte: startOfWeek },
                    },
                }),
                prisma.payment.aggregate({
                    _sum: { amount: true },
                    where: {
                        status: 'PAID',
                        booking: {
                            createdAt: { gte: startOfMonth },
                        },
                    },
                }),
                prisma.payment.aggregate({
                    _sum: { amount: true },
                    where: {
                        status: 'PAID',
                        booking: {
                            createdAt: { gte: startOfWeek },
                        },
                    },
                }),
                // Calculate average time from booking creation to completion
                prisma.booking.findMany({
                    where: {
                        status: 'COMPLETED',
                        createdAt: { gte: staff.createdAt },
                    },
                    select: {
                        createdAt: true,
                        updatedAt: true,
                    },
                }),
            ]);
            // Calculate average completion time
            const completionTimes = averageCompletionTime.map(booking => {
                const created = new Date(booking.createdAt);
                const completed = new Date(booking.updatedAt);
                return completed.getTime() - created.getTime();
            });
            const avgCompletionTimeMs = completionTimes.length > 0
                ? completionTimes.reduce((sum, time) => sum + time, 0) /
                    completionTimes.length
                : 0;
            const avgCompletionTimeHours = avgCompletionTimeMs / (1000 * 60 * 60);
            return {
                staffId: staff.id,
                staffName: staff.name,
                staffEmail: staff.email,
                joinDate: staff.createdAt,
                totalBookings,
                completedBookings,
                pendingBookings,
                completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
                monthlyBookings,
                weeklyBookings,
                monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
                weeklyRevenue: weeklyRevenue._sum.amount ?? 0,
                averageCompletionTimeHours: Math.round(avgCompletionTimeHours * 100) / 100,
            };
        }));
        return staffPerformance.sort((a, b) => Number(b.monthlyRevenue) - Number(a.monthlyRevenue));
    },
    async getStaffWorkloadDistribution() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const staffWorkload = await prisma.user.findMany({
            where: { role: { name: 'STAFF' }, isActive: true },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        const workloadData = await Promise.all(staffWorkload.map(async (staff) => {
            const [pendingBookings, inProgressBookings, completedToday, completedThisMonth,] = await Promise.all([
                prisma.booking.count({
                    where: { status: 'PENDING' },
                }),
                prisma.booking.count({
                    where: { status: 'IN_PROGRESS' },
                }),
                prisma.booking.count({
                    where: {
                        status: 'COMPLETED',
                        updatedAt: {
                            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                        },
                    },
                }),
                prisma.booking.count({
                    where: {
                        status: 'COMPLETED',
                        updatedAt: { gte: startOfMonth },
                    },
                }),
            ]);
            return {
                staffId: staff.id,
                staffName: staff.name,
                currentWorkload: pendingBookings + inProgressBookings,
                pendingBookings,
                inProgressBookings,
                completedToday,
                completedThisMonth,
            };
        }));
        return {
            totalPendingBookings: await prisma.booking.count({
                where: { status: 'PENDING' },
            }),
            totalInProgressBookings: await prisma.booking.count({
                where: { status: 'IN_PROGRESS' },
            }),
            staffWorkload: workloadData.sort((a, b) => b.currentWorkload - a.currentWorkload),
        };
    },
    async getStaffEfficiencyReport(startDate, endDate) {
        const start = startDate
            ? new Date(startDate)
            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        const staffEfficiency = await prisma.user.findMany({
            where: { role: { name: 'STAFF' }, isActive: true },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        const efficiencyData = await Promise.all(staffEfficiency.map(async (staff) => {
            const [totalBookings, completedBookings, revenueGenerated, averageOrderValue, customerSatisfaction,] = await Promise.all([
                prisma.booking.count({
                    where: {
                        createdAt: { gte: start, lte: end },
                    },
                }),
                prisma.booking.count({
                    where: {
                        status: 'COMPLETED',
                        createdAt: { gte: start, lte: end },
                    },
                }),
                prisma.payment.aggregate({
                    _sum: { amount: true },
                    where: {
                        status: 'PAID',
                        booking: {
                            createdAt: { gte: start, lte: end },
                        },
                    },
                }),
                prisma.booking.aggregate({
                    _avg: { totalAmount: true },
                    where: {
                        createdAt: { gte: start, lte: end },
                    },
                }),
                // For now, we'll use a placeholder for customer satisfaction
                // This could be linked to testimonials or ratings in the future
                Promise.resolve(4.5), // Placeholder
            ]);
            const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
            const avgOrderValue = averageOrderValue._avg.totalAmount ?? 0;
            return {
                staffId: staff.id,
                staffName: staff.name,
                period: {
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                },
                totalBookings,
                completedBookings,
                completionRate: Math.round(completionRate * 100) / 100,
                revenueGenerated: revenueGenerated._sum.amount ?? 0,
                averageOrderValue: Math.round(Number(avgOrderValue) * 100) / 100,
                customerSatisfaction,
                efficiency: (completionRate * Number(revenueGenerated._sum.amount ?? 0)) / 100, // Simple efficiency metric
            };
        }));
        return efficiencyData.sort((a, b) => b.efficiency - a.efficiency);
    },
};
export { ReportingService };
