"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceOverviewController = exports.deleteServiceController = exports.updateServiceController = exports.getServiceByIdController = exports.getAllServicesController = exports.getPublicServicesController = exports.createServiceController = void 0;
const serviceService = __importStar(require("../services/service.service"));
const createServiceController = async (req, res, next) => {
    try {
        const service = await serviceService.createService(req.body);
        res.status(201).json({
            data: service,
            message: 'Service created successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createServiceController = createServiceController;
const getPublicServicesController = async (_, res, next) => {
    try {
        const services = await serviceService.getPublicServices();
        res.status(200).json(services);
    }
    catch (error) {
        next(error);
    }
};
exports.getPublicServicesController = getPublicServicesController;
const getAllServicesController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res
                .status(401)
                .json({ message: 'Unauthorized: User ID not found' });
        }
        const services = await serviceService.getAllServices();
        res.status(200).json(services);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllServicesController = getAllServicesController;
const getServiceByIdController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const service = await serviceService.getServiceById(id);
        if (!service)
            return res.status(404).json({ message: 'Service not found' });
        res.status(200).json(service);
    }
    catch (error) {
        next(error);
    }
};
exports.getServiceByIdController = getServiceByIdController;
const updateServiceController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const updated = await serviceService.updateService(id, req.body);
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
};
exports.updateServiceController = updateServiceController;
const deleteServiceController = async (req, res, next) => {
    try {
        const id = req.params.id;
        const deleted = await serviceService.deleteService(id);
        res.json(deleted);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteServiceController = deleteServiceController;
const getServiceOverviewController = async (_, res, next) => {
    try {
        const overview = await serviceService.getServiceOverview();
        return res.status(200).json(overview);
    }
    catch (error) {
        next(error);
    }
};
exports.getServiceOverviewController = getServiceOverviewController;
