import api from "@/lib/axios";
import { ApiResponse, BranchesType, CompaniesResponse, ReorderBranchesPayload } from "@repo/shared";


export async function getCompanyDetailsServices() {
    const res = await api.get("/general/company-details")
    return res.data
}

export async function getCompanyDetailsByCodeServices(CompanyCode: string) : Promise <CompaniesResponse> {
        const res = await api.get(`/general/companies-by-code/${CompanyCode}`)
        return res.data
}

export const fetchCompanies = async () => {
  const { data } = await api.get("/general/companies");
  return data.data;
};


export const fetchLoanTypes = async (): Promise<string[]> => {

  const { data } = await api.get("/general/loan-types");

  return data.data;
};

export async function getBranchesService(): Promise<BranchesType[]> {
  const res = await api.get<ApiResponse<BranchesType[]>>("/general/branches")
  return res.data.data
}

export const reorderBranchesService = async (
  payload: ReorderBranchesPayload
): Promise<ApiResponse<null>> => {

  const res = await api.put<ApiResponse<null>>(
    "/general/branches-reorder",
    payload
  )

  return res.data
}


// GET
export const getBranchGroups = async () => {
  const res = await api.get("/general/branch-groups");
  return res.data;
};

// CREATE
export const createBranchGroup = async (name: string) => {
  const res = await api.post("/general/branch-groups", { name });
  return res.data;
};

// DELETE
export const deleteBranchGroup = async (id: number) => {
  await api.delete(`/general/branch-groups/${id}`);
};

// ASSIGN BRANCH

export const assignBranchGroupService = async ({
  branchCode,
  groupId,
}: {
  branchCode: string;
  groupId: number | null;
}) => {
  const res = await api.patch(
    `/general/branch-groups/${branchCode}/assign`,
    { groupId }
  );

  return res.data;
};




