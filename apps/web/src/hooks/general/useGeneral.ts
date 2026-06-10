// hooks/commission/useCommissionSettings.ts

import { useQuery } from "@tanstack/react-query";

import {
  getAllUserService,
  getCommissionSettings
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