import prisma from '../lib/prisma';
export const createService = async (data) => {
    return prisma.service.create({ data });
};
export const getPublicServices = async () => {
    return prisma.service.findMany({ where: { isActive: true } });
};
export const getAllServices = async () => {
    return prisma.service.findMany();
};
export const getServiceById = async (id) => {
    return prisma.service.findUnique({ where: { id } });
};
export const updateService = async (id, data) => {
    return prisma.service.update({ where: { id }, data });
};
export const deleteService = async (id) => {
    return prisma.service.update({
        where: { id },
        data: { isActive: false },
    });
};
export const getServiceOverview = async () => {
    const services = await prisma.service.findMany({
        where: { isActive: true },
        include: {
            bookings: {
                where: {
                    status: 'COMPLETED',
                },
                include: {
                    payments: true,
                },
            },
        },
    });
    return services.map(service => ({
        name: service.title ?? 'Unnamed Service',
        type: service.type ?? 'Unknown Type',
        price: `GMD ${Number(service.price.toFixed(2)).toLocaleString('en-US')}`,
        orders: service.bookings.length ?? 0,
        revenue: `GMD ${service.bookings
            .flatMap(booking => booking.payments)
            .reduce((sum, payment) => sum + Number(payment.amount), 0)
            .toLocaleString()}`,
        basePrice: Number(service.price),
        totalRevenue: service.bookings
            .flatMap(booking => booking.payments)
            .reduce((sum, payment) => sum + Number(payment.amount), 0),
        description: service.description,
    }));
};
