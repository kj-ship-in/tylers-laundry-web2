"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceOverview = exports.deleteService = exports.updateService = exports.getServiceById = exports.getAllServices = exports.getPublicServices = exports.createService = void 0;
const booking_model_1 = require("../models/booking.model");
const enums_1 = require("../types/enums");
const payment_model_1 = require("../models/payment.model");
const service_model_1 = require("../models/service.model");
const createService = async (data) => {
    return service_model_1.Service.create(data);
};
exports.createService = createService;
const getPublicServices = async () => {
    return service_model_1.Service.find({ isActive: true });
};
exports.getPublicServices = getPublicServices;
const getAllServices = async () => {
    return service_model_1.Service.find();
};
exports.getAllServices = getAllServices;
const getServiceById = async (id) => {
    return service_model_1.Service.findById(id);
};
exports.getServiceById = getServiceById;
const updateService = async (id, data) => {
    return service_model_1.Service.findByIdAndUpdate(id, data, { new: true });
};
exports.updateService = updateService;
const deleteService = async (id) => {
    return service_model_1.Service.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
exports.deleteService = deleteService;
const getServiceOverview = async () => {
    const services = await service_model_1.Service.find({ isActive: true });
    return Promise.all(services.map(async (service) => {
        const bookings = await booking_model_1.Booking.find({ serviceId: service._id, status: enums_1.BookingStatus.COMPLETED });
        const bookingIds = bookings.map(b => b._id);
        const payments = await payment_model_1.Payment.find({ bookingId: { $in: bookingIds } });
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
exports.getServiceOverview = getServiceOverview;
