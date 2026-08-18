import axiosInstance, { api } from "@/lib/axios";
import { BranchesResponse, BranchOption, CommissionSettingsResponse, CompanyOption, CompanyResponse, CreateBranchPayload, CreateCompanyPayload, DeleteBranchParams, DeleteUserParams, EligibleAgentOption, GetBranchesResponse, GetBranchParams, GetCompanyParams, GetMasterlistResponse, GetRolesApiResponse, GetUserResponse, GetUsersParams, OverrideRulePayload, RoleOption, SearchEligibleAgentsResponse, UpdateBranchParams, UpdateCompanyParams } from "@repo/shared";

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

export const getBranchesService = async (
  params: GetBranchParams
): Promise<BranchesResponse> => {

  const res = await api.get(
    "/general/getBranchesSetting",
    {
      params,
    }
  );

  return res.data;
};

export const getCompaniesService = async (
  params: GetCompanyParams
): Promise<CompanyResponse> => {

  const res = await api.get(
    "/general/getCompaniesSetting",
    {
      params,
    }
  );

  return res.data;
};

export const getCompanyOptions =
  async (): Promise<CompanyOption[]> => {
    const response =
      await api.get(
        "/general/companies/options"
      );

    return response.data.data;
  };

export const createCompanyService = 
  async (
      payload: CreateCompanyPayload
  ) => {
    const response = 
      await api.post(
        "general/company",
        payload
      );

    return response.data;
  }

export const createBranchService =
  async (
    payload: CreateBranchPayload
  ) => {
    const response =
      await api.post(
        "/general/branches",
        payload
      );

    return response.data;
  };

export const updateBranchService = async ({
  branchCode,
  payload,
}: UpdateBranchParams) => {
  const response = await api.patch(
    `/general/branches/${branchCode}`,
    payload
  );

  return response.data;
};

export const updateCompanyService = async(
  params: UpdateCompanyParams
) => {
  const response = await api.patch(
    `/general/company/${params.companyCode}`,
    {
      actionType:
        params.actionType,
      
      ...(params.actionType === "EDIT"
        ? {
          companyName:
            params.payload?.companyName
        }
        :{}),
    }
  );
  return response.data;
}

export const deleteBranchService = async ({
  branchCode,
}: DeleteBranchParams) => {
  const response = await api.delete(
    `/general/branches/${branchCode}`
  );

  return response.data;
};


export const DeleteUserService = async ({
  userId,
}:DeleteUserParams) => {
  const response = await api.put(
    `/general/delete-user/${userId}`
  );
  return response.data;
}


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