import { Request, Response, NextFunction } from 'express';

import * as serviceService from '../services/service.service';

export const createServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const service = await serviceService.createService(req.body);
    res.status(201).json({
      data: service,
      message: 'Service created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicServicesController = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const services = await serviceService.getPublicServices();
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

export const getAllServicesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: User ID not found' });
    }

    const services = await serviceService.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

export const getServiceByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const id = req.params.id;
    const service = await serviceService.getServiceById(id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json(service);
  } catch (error) {
    next(error);
  }
};

export const updateServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const updated = await serviceService.updateService(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteServiceController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    const deleted = await serviceService.deleteService(id);
    res.json(deleted);
  } catch (error) {
    next(error);
  }
};

export const getServiceOverviewController = async (
  _: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const overview = await serviceService.getServiceOverview();
    return res.status(200).json(overview);
  } catch (error) {
    next(error);
  }
};
