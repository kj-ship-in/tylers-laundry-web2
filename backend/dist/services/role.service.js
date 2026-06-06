"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserPermissions = exports.addUserPermissions = exports.resetUserPermissions = exports.assignRoleToUser = exports.getAllPermissions = exports.assignPermissionsToRole = exports.deleteRole = exports.updateRole = exports.getRoleById = exports.getAllRoles = exports.createRole = void 0;
const role_model_1 = require("../models/role.model");
const user_model_1 = require("../models/user.model");
const enums_1 = require("../types/enums");
const createRole = async (data) => {
    const existingRole = await role_model_1.Role.findOne({ name: data.name });
    if (existingRole)
        throw new Error('Role with this name already exists');
    const role = await role_model_1.Role.create({
        name: data.name,
        description: data.description,
        permissions: data.permissions,
    });
    const users = await user_model_1.User.find({ roleId: role._id }).select('_id name email');
    return { ...role.toObject(), users };
};
exports.createRole = createRole;
const getAllRoles = async (includeInactive = false) => {
    const query = includeInactive ? {} : { isActive: true };
    const roles = await role_model_1.Role.find(query).sort({ name: 1 });
    return Promise.all(roles.map(async (role) => {
        const users = await user_model_1.User.find({ roleId: role._id }).select('_id name email');
        return { ...role.toObject(), users, _count: { users: users.length } };
    }));
};
exports.getAllRoles = getAllRoles;
const getRoleById = async (id) => {
    const role = await role_model_1.Role.findById(id);
    if (!role)
        return null;
    const users = await user_model_1.User.find({ roleId: role._id }).select('_id name email');
    return { ...role.toObject(), users, _count: { users: users.length } };
};
exports.getRoleById = getRoleById;
const updateRole = async (id, data) => {
    const existingRole = await role_model_1.Role.findById(id);
    if (!existingRole)
        throw new Error('Role not found');
    if (existingRole.isSystem)
        throw new Error('Cannot modify system roles');
    if (data.name && data.name !== existingRole.name) {
        const nameConflict = await role_model_1.Role.findOne({ name: data.name });
        if (nameConflict)
            throw new Error('Role with this name already exists');
    }
    const updated = await role_model_1.Role.findByIdAndUpdate(id, data, { new: true });
    const users = await user_model_1.User.find({ roleId: id }).select('_id name email');
    return { ...updated.toObject(), users, _count: { users: users.length } };
};
exports.updateRole = updateRole;
const deleteRole = async (id) => {
    const existingRole = await role_model_1.Role.findById(id);
    if (!existingRole)
        throw new Error('Role not found');
    if (existingRole.isSystem)
        throw new Error('Cannot delete system roles');
    const userCount = await user_model_1.User.countDocuments({ roleId: id });
    if (userCount > 0) {
        throw new Error('Cannot delete role that has assigned users. Please reassign users first.');
    }
    return role_model_1.Role.findByIdAndUpdate(id, { isActive: false }, { new: true });
};
exports.deleteRole = deleteRole;
const assignPermissionsToRole = async (id, permissions) => {
    const existingRole = await role_model_1.Role.findById(id);
    if (!existingRole)
        throw new Error('Role not found');
    const updated = await role_model_1.Role.findByIdAndUpdate(id, { permissions }, { new: true });
    const users = await user_model_1.User.find({ roleId: id }).select('_id name email');
    return { ...updated.toObject(), users };
};
exports.assignPermissionsToRole = assignPermissionsToRole;
const getAllPermissions = () => {
    return Object.values(enums_1.Permission);
};
exports.getAllPermissions = getAllPermissions;
const assignRoleToUser = async (userId, roleId) => {
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new Error('User not found');
    const role = await role_model_1.Role.findById(roleId);
    if (!role?.isActive)
        throw new Error('Role not found or inactive');
    return user_model_1.User.findByIdAndUpdate(userId, { roleId }, { new: true }).populate('roleId');
};
exports.assignRoleToUser = assignRoleToUser;
const resetUserPermissions = async (userId) => {
    return user_model_1.User.findByIdAndUpdate(userId, { permissions: [] }, { new: true }).populate('roleId');
};
exports.resetUserPermissions = resetUserPermissions;
const addUserPermissions = async (userId, permissions) => {
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new Error('User not found');
    const existingPermissions = (user.permissions ?? []);
    const allPermissions = [...new Set([...existingPermissions, ...permissions])];
    return user_model_1.User.findByIdAndUpdate(userId, { permissions: allPermissions }, { new: true }).populate('roleId');
};
exports.addUserPermissions = addUserPermissions;
const removeUserPermissions = async (userId, permissions) => {
    const user = await user_model_1.User.findById(userId);
    if (!user)
        throw new Error('User not found');
    const existingPermissions = (user.permissions ?? []);
    const updatedPermissions = existingPermissions.filter(p => !permissions.includes(p));
    return user_model_1.User.findByIdAndUpdate(userId, { permissions: updatedPermissions }, { new: true }).populate('roleId');
};
exports.removeUserPermissions = removeUserPermissions;
