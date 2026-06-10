import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createCommissionScanService,
  scannedAgentService,
  updateCommissionRule,
} from "@/services/commission/commission.service";

import {
  CreateCommissionPayload,
  ScannedAgentParams,
} from "@repo/shared";

export const useScannedAgent = (
  params: ScannedAgentParams
) => {

  return useQuery({
    queryKey: [
      "scanned-agent",
      params,
    ],

    queryFn: () =>
      scannedAgentService(
        params
      ),

    enabled:
      !!params.agentCode &&
      !!params.clientId,
  });
};

export const useCreateCommissionScan =
  () => {

    const queryClient =
      useQueryClient();

    return useMutation({

      mutationFn: (
        payload: CreateCommissionPayload
      ) =>
        createCommissionScanService(
          payload
        ),

      onSuccess: () => {

        queryClient.invalidateQueries({
          queryKey: ["clients"],
        });

        queryClient.invalidateQueries({
          queryKey: ["scanned-agent"],
        });

      },
    });
  };

export const useUpdateCommissionRule =
  () => {

    const queryClient =
      useQueryClient();

    return useMutation({

      mutationFn:
        updateCommissionRule,

      onSuccess: () => {

        queryClient.invalidateQueries({
          queryKey: [
            "commission-settings"
          ]
        });

      }
    });
  };