import { checkReactivationService, selfReactivateService } from "@/services/reactivation/reactivation.service";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";



export const useCheckReactivation = (
  enabled: boolean
) => {
  return useQuery({
    queryKey: [
      "reactivation-check",
    ],

    queryFn:
      checkReactivationService,

    enabled,
  });
};

export const useSelfReactivate = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      selfReactivateService,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "reactivation-check",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "auth-user",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "agent",
        ],
      });
    },
  });
};