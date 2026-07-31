import axiosInstance, { api } from "@/lib/axios";
import { BranchOption, CommissionSettingsResponse, EligibleAgentOption, GetBranchesResponse, GetMasterlistResponse, GetRolesApiResponse, GetUserResponse, GetUsersParams, OverrideRulePayload, RoleOption, SearchEligibleAgentsResponse } from "@repo/shared";

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



export const searchEligibleAgents =
  async (
    search: string
  ): Promise<EligibleAgentOption[]> => {
    const response =
      await api.get<SearchEligibleAgentsResponse>(
        "/general/searchEligibleAgents",
        {
          params: {
            search,
          },
        }
      );

    return response.data.data;
  };


export async function createOverrideRule(
  payload: OverrideRulePayload
) {
  const response = await api.post(
    "/general/create-override-rules",
    payload
  );
  return response.data;
}

export async function UpdateOverrideRules({
  id,
  ...payload
}: OverrideRulePayload & {
  id:string
}){
  const response = await api.put(
    `/general/update-override-rules/${id}`,
    payload
  );
  return response.data;
}



export async function deleteOverrideRule(
  id: string
) {
  const response = await api.delete(
    `/general/delete-override-rules/${id}`
  );

  return response.data;
}