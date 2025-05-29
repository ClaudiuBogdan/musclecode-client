export enum PermissionLevel {
    VIEW = 'VIEW',
    INTERACT = 'INTERACT',
    EDIT = 'EDIT',
    MANAGE = 'MANAGE',
    OWNER = 'OWNER'
}

export interface Permission {
    id: string;
    type: 'explicit' | 'inherited';
    contentNodeId: string;
    userId?: string;
    groupId?: string;
    permissionLevel: PermissionLevel;
    grantedBy: string | null;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}