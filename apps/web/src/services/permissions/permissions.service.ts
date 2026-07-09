import api from "@/lib/axios";
import {
  GetPermissionManagementApiResponse,
  PermissionManagementResponse,
  UpdateRolePermissionsPayload,
  UpdateRolePermissionsApiResponse,
} from "@repo/shared";

export const getPermissionManagement =
  async (): Promise<PermissionManagementResponse> => {
    const response =
      await api.get<GetPermissionManagementApiResponse>(
        "/permissions/permissions"
      );

    return response.data.data;
  };

export const updateRolePermissions = async (
  payload: UpdateRolePermissionsPayload
): Promise<UpdateRolePermissionsApiResponse> => {
  const response =
    await api.put<UpdateRolePermissionsApiResponse>(
      "/permissions/role-permissions",
      payload
    );

  return response.data;
};