import api from "@/lib/axios";
import { fetchCompanies, getBranchesService, getCompanyDetailsByCodeServices, getCompanyDetailsServices, reorderBranchesService } from "@/services/general.services";
import { BranchesType, CompaniesResponse, CompanyDetailsType, FecthCompany, ReorderBranchesPayload } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useGetCompanyDetails(){
    return useQuery<CompanyDetailsType[]>({
        queryKey: ["company-details"],
        queryFn: getCompanyDetailsServices,
        staleTime: 1000 * 60 * 5
    })
}


  
  export function useCompaniesByCycle(cycle: string) {
    return useQuery<CompaniesResponse>({
      queryKey: ["companies-by-cycle",cycle],
      queryFn: async () => {
        const res = await api.get("/general/companies-by-cycle", {
          params: { cycle },
        });
        return res.data;
      },
        enabled: !!cycle,
    });
  }



  // cycle & company

  export function useCompanyCycles() {
    return useQuery({
      queryKey: ["company-cycles"],
      queryFn: async () => {
        const res = await api.get("/general/fetch-company-cycle");
        return res.data;
      },
    });
  }



  export function useGetCompanyByCode(companyCode: string) {
    return useQuery({
      queryKey: ["companies-by-code", companyCode],
      queryFn: () => getCompanyDetailsByCodeServices(companyCode),
      enabled: !!companyCode,
    })
  }

export const useCompanies = () => {
  return useQuery<FecthCompany[], Error>({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: 1000 * 60 * 10,
  });
};



export const useGetBranches = () => {
    return useQuery<BranchesType[]>({
      queryKey: ["branches"],
      queryFn: getBranchesService,
      staleTime: 1000 * 60 * 10
    })
  }
  
  
  export const useReorderBranches = () => {
  
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (payload: ReorderBranchesPayload) =>
        reorderBranchesService(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["branches"] })
      }
    })
  }
  
  
  
  
  
  type Branch = {
    branchCode: string;
    Location: string | null;
  };
  
  export function useFetchBranches() {
    return useQuery<Branch[]>({
      queryKey: ["branches-list"],
      queryFn: async () => {
        const res = await api.get("/general/branch-list");
        return res.data;
      },
    });
  }
  
  
  
  
