import axiosInstance, { api } from "@/lib/axios";
import { BranchOption, CommissionSettingsResponse, GetBranchesResponse, GetMasterlistResponse, GetRolesApiResponse, GetUserResponse, GetUsersParams, RoleOption } from "@repo/shared";

export const getCommissionSettings =
  async (): Promise<CommissionSettingsResponse> => {

    const response =
      await axiosInstance.get(
        "/general/settings"
      );

    return response.data.data;
};


export const getAllUserService = async (
  params: GetUsersParams
): Promise<GetUserResponse> => {

  const res = await api.get(
    "/general/getUsers",
    {
      params,
    }
  );

  return res.data;
};

export const getRoles = async (): Promise<RoleOption[]> =>{
  const response = await api.get<GetRolesApiResponse>("/general/getRoles");
  return response.data.data;
};

export const getBranches = async (): Promise<BranchOption[]> => {
  const response = await api.get<GetBranchesResponse>(
    "/general/getBranches"
  );

  return response.data.data;
};