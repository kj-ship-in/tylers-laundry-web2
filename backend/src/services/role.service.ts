import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { Permission } from '../types/enums';

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: Permission[];
  isActive?: boolean;
}

export const createRole = async (data: CreateRoleData) => {
  const existingRole = await Role.findOne({ name: data.name });
  if (existingRole) throw new Error('Role with this name already exists');

  const role = await Role.create({
    name: data.name,
    description: data.description,
    permissions: data.permissions,
  });

  const users = await User.find({ roleId: role._id }).select('_id name email');
  return { ...role.toObject(), users };
};

export const getAllRoles = async (includeInactive = false) => {
  const query = includeInactive ? {} : { isActive: true };
  const roles = await Role.find(query).sort({ name: 1 });

  return Promise.all(
    roles.map(async role => {
      const users = await User.find({ roleId: role._id }).select('_id name email');
      return { ...role.toObject(), users, _count: { users: users.length } };
    }),
  );
};

export const getRoleById = async (id: string) => {
  const role = await Role.findById(id);
  if (!role) return null;

  const users = await User.find({ roleId: role._id }).select('_id name email');
  return { ...role.toObject(), users, _count: { users: users.length } };
};

export const updateRole = async (id: string, data: UpdateRoleData) => {
  const existingRole = await Role.findById(id);
  if (!existingRole) throw new Error('Role not found');
  if (existingRole.isSystem) throw new Error('Cannot modify system roles');

  if (data.name && data.name !== existingRole.name) {
    const nameConflict = await Role.findOne({ name: data.name });
    if (nameConflict) throw new Error('Role with this name already exists');
  }

  const updated = await Role.findByIdAndUpdate(id, data, { new: true });
  const users = await User.find({ roleId: id }).select('_id name email');
  return { ...updated!.toObject(), users, _count: { users: users.length } };
};

export const deleteRole = async (id: string) => {
  const existingRole = await Role.findById(id);
  if (!existingRole) throw new Error('Role not found');
  if (existingRole.isSystem) throw new Error('Cannot delete system roles');

  const userCount = await User.countDocuments({ roleId: id });
  if (userCount > 0) {
    throw new Error('Cannot delete role that has assigned users. Please reassign users first.');
  }

  return Role.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

export const assignPermissionsToRole = async (id: string, permissions: Permission[]) => {
  const existingRole = await Role.findById(id);
  if (!existingRole) throw new Error('Role not found');

  const updated = await Role.findByIdAndUpdate(id, { permissions }, { new: true });
  const users = await User.find({ roleId: id }).select('_id name email');
  return { ...updated!.toObject(), users };
};

export const getAllPermissions = (): Permission[] => {
  return Object.values(Permission);
};

export const assignRoleToUser = async (userId: string, roleId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const role = await Role.findById(roleId);
  if (!role?.isActive) throw new Error('Role not found or inactive');

  return User.findByIdAndUpdate(userId, { roleId }, { new: true }).populate('roleId');
};

export const resetUserPermissions = async (userId: string) => {
  return User.findByIdAndUpdate(userId, { permissions: [] }, { new: true }).populate('roleId');
};

export const addUserPermissions = async (userId: string, permissions: Permission[]) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const existingPermissions = (user.permissions ?? []) as Permission[];
  const allPermissions = [...new Set([...existingPermissions, ...permissions])];

  return User.findByIdAndUpdate(userId, { permissions: allPermissions }, { new: true }).populate('roleId');
};

export const removeUserPermissions = async (userId: string, permissions: Permission[]) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const existingPermissions = (user.permissions ?? []) as Permission[];
  const updatedPermissions = existingPermissions.filter(p => !permissions.includes(p as Permission));

  return User.findByIdAndUpdate(
    userId,
    { permissions: updatedPermissions },
    { new: true },
  ).populate('roleId');
};
