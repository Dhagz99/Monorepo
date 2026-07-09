export interface PermissionItem {
  id: number;
  code: string;
  name: string;
}

export interface RolePermissionItem {
  id: number;
  name: string;
  permissions: PermissionItem[];
}

export interface PermissionManagementResponse {
  roles: RolePermissionItem[];
  permissions: PermissionItem[];
}

export interface GetPermissionManagementApiResponse {
  success: boolean;
  data: PermissionManagementResponse;
}

export interface UpdateRolePermissionsPayload {
  roleId: number;
  permissionIds: number[];
}

export interface UpdateRolePermissionsApiResponse {
  success: boolean;
  message: string;
}