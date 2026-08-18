// hooks/commission/useCommissionSettings.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBranchService,
  createOverrideRule,
  deleteBranchService,
  deleteOverrideRule,
  getAllUserService,
  getBranches,
  getBranchesService,
  getCommissionSettings,
  getCompanyOptions,
  getRoles,
  DeleteUserService,
  searchEligibleAgents,
  updateBranchService,
  UpdateOverrideRules,
  getCompaniesService,
  createCompanyService,
  updateCompanyService
} from "../../services/general/general.service";
import { CommissionSettingsResponse, EligibleAgentOption, GetBranchParams, GetCompanyParams, GetUsersParams, OverrideRulePayload } from "@repo/shared";


export const useCommissionSettings =
  () => {

    return useQuery<
      CommissionSettingsResponse
    >({
      queryKey: [
        "commission-settings"
      ],

      queryFn:
        getCommissionSettings,
    });
};

export const useMasterlistUsers = (
  params: GetUsersParams
) => {
  return useQuery({
    queryKey: ["userlist", params],

    queryFn: () =>
      getAllUserService(params),
  });
};

export const useBranchesSetting = (
  params: GetBranchParams
) => {
  return useQuery({
    queryKey: ["branchlist", params],

    queryFn: () =>
      getBranchesService(params),
  });
};

export const useCompanySetting = (
  params: GetCompanyParams
) => {
  return useQuery({
    queryKey: ["companylist", params],

    queryFn: () =>
      getCompaniesService(params),
  });
};

export const useCompanyOptions = () => {
  return useQuery({
    queryKey: [
      "company-options",
    ],

    queryFn:
      getCompanyOptions,

    staleTime:
      1000 * 60 * 10,
  });
};
export const useCreateCompany = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createCompanyService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "companylist",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "company-options",
        ],
      });

    }
  })
}
export const useCreateBranch = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      createBranchService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "branchlist",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "branch-options",
        ],
      });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      updateBranchService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "branchlist",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "branch-options",
        ],
      });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = 
    useQueryClient();

  return useMutation({
    mutationFn:
      updateCompanyService,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:[
          "companylist",
        ],
      });

      queryClient.invalidateQueries({
        queryKey:[
          "company-options"
        ],
      });    
    }
  })
}

export const useDeleteBranch = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deleteBranchService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "branchlist",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "branch-options",
        ],
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = 
    useQueryClient();

  return useMutation({
    mutationFn:
      DeleteUserService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:[
          "branchlist"
        ],
      });

      queryClient.invalidateQueries({
        queryKey:[
          "branch-options",
        ],
      });
    },
  });
}

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: getRoles
  });
};

export const useBranches = () => {
  return useQuery({
    queryKey: ["branch-options"],
    queryFn: getBranches,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};


export const useSearchEligibleAgents =
  (
    search: string
  ) => {
    const normalizedSearch =
      search.trim();

    return useQuery<
      EligibleAgentOption[]
    >({
      queryKey: [
        "eligible-agents",
        normalizedSearch,
      ],

      queryFn: () =>
        searchEligibleAgents(
          normalizedSearch
        ),

      enabled:
        normalizedSearch.length >= 2,

      staleTime:
        1000 * 30,

      refetchOnWindowFocus:
        false,
    });
  };


  export function useCreateOverrideRule() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: OverrideRulePayload
    ) =>
      createOverrideRule(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "commission-settings",
        ],
      });
    },
  });
}

export function useUpdateOverrideRule() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      payload: OverrideRulePayload & {
        id: string;
      }
    ) =>
      UpdateOverrideRules(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "commission-settings",
        ],
      });
    },
  });
}

export function useDeleteOverrideRule() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      deleteOverrideRule(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "commission-settings",
        ],
      });
    },
  });
}