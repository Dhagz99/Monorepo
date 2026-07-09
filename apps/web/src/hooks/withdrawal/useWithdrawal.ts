import { approveWithdrawalRequest, createMyWithdrawalRequest, rejectWithdrawalRequest } from "@/services/withdrawal/withdrawal.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export const useCreateMyWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMyWithdrawalRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agent-details"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-withdrawal-requests"],
      });
    },
  });
};


export const useApproveWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveWithdrawalRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-withdrawals"],
      });
    },
  });
};

export const useRejectFailedWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectWithdrawalRequest,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-withdrawals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["agent-details"],
      });
    },
  });
};