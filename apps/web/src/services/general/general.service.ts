import axiosInstance, { api } from "@/lib/axios";
import { CommissionSettingsResponse, GetMasterlistResponse, GetUserResponse, GetUsersParams } from "@repo/shared";

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