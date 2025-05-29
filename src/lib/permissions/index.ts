import { PermissionLevel, type Permission } from "@/types/permissions";

export const hasManagePermission = (permission: Permission) => {
    return permission.permissionLevel === PermissionLevel.MANAGE || permission.permissionLevel === PermissionLevel.OWNER;
};
