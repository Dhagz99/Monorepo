// hooks/commission/useCommissionSettings.ts

import { useQuery } from "@tanstack/react-query";

import {
  getAllUserService,
  getBranches,
  getCommissionSettings,
  getRoles
} from "../../services/general/general.service";
import { CommissionSettingsResponse, GetUsersParams } from "@repo/shared";


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