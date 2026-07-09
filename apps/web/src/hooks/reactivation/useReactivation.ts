import { checkReactivationService, getMyReactivationApprovalProgress, getMyReactivationApprovalsService, reviewReactivationApprovalService, selfReactivateService, submitAdminReactivationRequestService } from "@/services/reactivation/reactivation.service";
import { GetMyReactivationApprovalsParams, ReviewReactivationApprovalPayload } from "@repo/shared";
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




export const useSubmitAdminReactivationRequest =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: (
        formData: FormData
      ) =>
        submitAdminReactivationRequestService(
          formData
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["agent-details"],
        });

        queryClient.invalidateQueries({
          queryKey: ["remaining-sales"],
        });
      },
    });
  };


export const useMyReactivationApprovals =
  (
    params: GetMyReactivationApprovalsParams
  ) => {
    return useQuery({
      queryKey: [
        "my-reactivation-approvals",
        params.page,
        params.limit,
        params.search,
        params.status,
      ],

      queryFn: () =>
        getMyReactivationApprovalsService(
          params
        ),
    });
  };


export const useReviewReactivationApproval =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: (
        payload: ReviewReactivationApprovalPayload
      ) =>
        reviewReactivationApprovalService(
          payload
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "my-reactivation-approvals",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: ["agent-details"],
        });

        queryClient.invalidateQueries({
          queryKey: ["remaining-sales"],
        });
      },
    });
  };

export const useMyReactivationApprovalProgress = (
  requestId?: string | null,
  enabled = true
) => {
  return useQuery({
    queryKey: [
      "my-reactivation-approval-progress",
      requestId,
    ],
    queryFn: () =>
      getMyReactivationApprovalProgress(requestId as string),
    enabled: enabled && !!requestId,
  });
};