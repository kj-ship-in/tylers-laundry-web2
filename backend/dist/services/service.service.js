import { Booking } from '../models/booking.model';
import { BookingStatus } from '../types/enums';
import { Payment } from '../models/payment.model';
import { Service } from '../models/service.model';
export const createService = async (data) => {
    return Service.create(data);
};
export const getPublicServices = async () => {
    return Service.find({ isActive: true });
};
export const getAllServices = async () => {
    return Service.find();
};
export const getServiceById = async (id) => {
    return Service.findById(id);
};
export const updateService = async (id, data) => {
    return Service.findByIdAndUpdate(id, data, { new: true });
};
export const deleteService = async (id) => {
    return Service.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
export const getServiceOverview = async () => {
    const services = await Service.find({ isActive: true });
    return Promise.all(services.map(async (service) => {
        const bookings = await Booking.find({ serviceId: service._id, status: BookingStatus.COMPLETED });
        const bookingIds = bookings.map(b => b._id);
        const payments = await Payment.find({ bookingId: { $in: bookingIds } });
        const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
        return {
            name: service.title ?? 'Unnamed Service',
            type: service.type ?? 'Unknown Type',
            price: `GMD ${Number(service.price.toFixed(2)).toLocaleString('en-US')}`,
            orders: bookings.length,
            revenue: `GMD ${totalRevenue.toLocaleString()}`,
            basePrice: Number(service.price),
            totalRevenue,
            description: service.description,
        };
    }));
};
