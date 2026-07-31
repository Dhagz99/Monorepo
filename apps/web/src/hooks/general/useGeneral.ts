// hooks/commission/useCommissionSettings.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createOverrideRule,
  deleteOverrideRule,
  getAllUserService,
  getBranches,
  getCommissionSettings,
  getRoles,
  searchEligibleAgents,
  UpdateOverrideRules
} from "../../services/general/general.service";
import { CommissionSettingsResponse, EligibleAgentOption, GetUsersParams, OverrideRulePayload } from "@repo/shared";


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