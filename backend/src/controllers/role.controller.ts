/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import * as roleService from '../services/role.service';
import {
  CreateRoleSchema,
  UpdateRoleSchema,
  AssignPermissionsSchema,
  AssignRoleToUserSchema,
  UserPermissionsSchema,
  RoleIdSchema,
  UserIdSchema,
} from '../validators/role.schema';

export const createRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { name, description, permissions } = CreateRoleSchema.parse(req.body);

    const role = await roleService.createRole({
      name,
      description,
      permissions,
    });

    res.status(201).json({
      data: role,
      message: 'Role created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRolesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const roles = await roleService.getAllRoles(includeInactive);

    res.status(200).json(roles);
  } catch (error) {
    next(error);
  }
};

export const getRoleByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { id } = RoleIdSchema.parse(req.params);
    const role = await roleService.getRoleById(id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.status(200).json(role);
  } catch (error) {
    next(error);
  }
};

export const updateRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { id } = RoleIdSchema.parse(req.params);
    const { name, description, permissions, isActive } = UpdateRoleSchema.parse(
      req.body,
    );

    const role = await roleService.updateRole(id, {
      name,
      description,
      permissions,
      isActive,
    });

    res.status(200).json({
      data: role,
      message: 'Role updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { id } = RoleIdSchema.parse(req.params);
    await roleService.deleteRole(id);

    res.status(200).json({
      message: 'Role deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const assignPermissionsToRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { id } = RoleIdSchema.parse(req.params);
    const { permissions } = AssignPermissionsSchema.parse(req.body);

    const role = await roleService.assignPermissionsToRole(id, permissions);

    res.status(200).json({
      data: role,
      message: 'Permissions assigned to role successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPermissionsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const permissions = roleService.getAllPermissions();

    res.status(200).json(permissions);
  } catch (error) {
    next(error);
  }
};

export const assignRoleToUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { userId, roleId } = AssignRoleToUserSchema.parse(req.body);

    const user = await roleService.assignRoleToUser(userId, roleId);

    res.status(200).json({
      data: user,
      message: 'Role assigned to user successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetUserPermissionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { userId } = UserIdSchema.parse(req.params);

    const user = await roleService.resetUserPermissions(userId);

    res.status(200).json({
      data: user,
      message: 'User permissions reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const addUserPermissionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { userId } = UserIdSchema.parse(req.params);
    const { permissions } = UserPermissionsSchema.parse(req.body);

    const user = await roleService.addUserPermissions(userId, permissions);

    res.status(200).json({
      data: user,
      message: 'Permissions added to user successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const removeUserPermissionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> => {
  try {
    const { userId } = UserIdSchema.parse(req.params);
    const { permissions } = UserPermissionsSchema.parse(req.body);

    const user = await roleService.removeUserPermissions(userId, permissions);

    res.status(200).json({
      data: user,
      message: 'Permissions removed from user successfully.',
    });
  } catch (error) {
    next(error);
  }
};
